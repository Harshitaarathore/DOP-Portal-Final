const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendMeetingSubmittedEmail, sendMeetingApprovedEmail, sendMeetingRejectedEmail, sendMeetingRescheduledEmail } = require('../utils/email');

const logAudit = (user_id, action, module) => {
  const sql = `INSERT INTO audit_logs (id, user_id, action, module) VALUES (?, ?, ?, ?)`;
  db.query(sql, [uuidv4(), user_id, action, module], (err) => {
    if (err) console.log('Audit log error:', err.message);
  });
};



// SUBMIT MEETING REQUEST (Staff)
const submitRequest = (req, res) => {
  const { purpose, priority, preferred_date, preferred_time, requester_name, department } = req.body;
  const requester_id = req.user.id;
  const id = uuidv4();
  const attachment = req.file ? req.file.filename : null;

  const sql = `INSERT INTO meeting_requests (id, requester_id, purpose, priority, preferred_date, preferred_time, requester_name, department, attachment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [id, requester_id, purpose, priority, preferred_date, preferred_time, requester_name || '', department || '', attachment], async (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // Notify Secretary/Director
    db.query(`SELECT id, role FROM users WHERE role IN ('Director', 'Secretary') AND status = 'active'`, (err2, users) => {
      if (!err2 && users) {
        const reqDate = preferred_date ? new Date(preferred_date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '';
        users.forEach(u => {
          db.query(`INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`,
            [uuidv4(), u.id, `📅 New Meeting Request: "${purpose}" on ${reqDate} (Priority: ${priority})`, 'meeting_request']);
        });
      }
    });

    // Email confirmation to requester
    try {
      const userRes = await new Promise((resolve, reject) => {
        db.query(`SELECT email, name FROM users WHERE id = ?`, [requester_id], (e, r) => e ? reject(e) : resolve(r));
      });
      if (userRes.length > 0) {
        await sendMeetingSubmittedEmail(userRes[0].email, userRes[0].name, purpose, preferred_date, priority);
      }
    } catch (emailErr) { console.log('Submission email failed:', emailErr.message); }

    logAudit(requester_id, 'SUBMITTED meeting request', 'Meetings');
    res.json({ success: true, message: 'Meeting request submitted', data: null });
  });
};

// GET ALL REQUESTS (Secretary)
const getAllRequests = (req, res) => {
  const { status, priority } = req.query;

  let sql = `SELECT * FROM meeting_requests WHERE 1=1`;
  const params = [];

  if (status) { sql += ` AND status = ?`; params.push(status); }
  if (priority) { sql += ` AND priority = ?`; params.push(priority); }

  sql += ` ORDER BY created_at DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Requests fetched', data: results });
  });
};

// APPROVE REQUEST (Director only)
const approveRequest = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE meeting_requests SET status = 'Approved' WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    const getSql = `SELECT mr.*, u.email, u.name FROM meeting_requests mr JOIN users u ON u.id = mr.requester_id WHERE mr.id = ?`;

    db.query(getSql, [id], async (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true, message: 'Request approved', data: null });

      const request = results[0];

      logAudit(req.user.id, 'APPROVED meeting request', 'Meetings');

      // Send notification
      const notifSql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
      db.query(notifSql, [uuidv4(), request.requester_id, 'Your meeting request has been approved', 'meeting_approved']);

      // Send email
      try {
        await sendMeetingApprovedEmail(request.email, request.name, request.purpose, request.preferred_date);
      } catch (emailErr) {
        console.log('Approval email failed:', emailErr.message);
      }

      res.json({ success: true, message: 'Request approved, notification and email sent', data: null });
    });
  });
};

// REJECT REQUEST (Director only)
const rejectRequest = (req, res) => {
  const { id } = req.params;
  const { reason } = req.body; // reason for rejection

  const sql = `UPDATE meeting_requests SET status = 'Rejected', rejection_reason = ? WHERE id = ?`;
  db.query(sql, [reason || null, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    const getSql = `SELECT mr.*, u.email, u.name FROM meeting_requests mr JOIN users u ON u.id = mr.requester_id WHERE mr.id = ?`;
    db.query(getSql, [id], async (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true, message: 'Request rejected', data: null });
      const request = results[0];
      logAudit(req.user.id, 'REJECTED meeting request', 'Meetings');
      db.query(`INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`,
        [uuidv4(), request.requester_id, `Your meeting request has been rejected${reason ? ': ' + reason : ''}`, 'meeting_rejected']);
      try {
        await sendMeetingRejectedEmail(request.email, request.name, request.purpose, reason);
      } catch (emailErr) { console.log('Rejection email failed:', emailErr.message); }
      res.json({ success: true, message: 'Request rejected', data: null });
    });
  });
};

// RESCHEDULE REQUEST (Secretary or Director)
const rescheduleRequest = (req, res) => {
  const { id } = req.params;
  const { preferred_date, preferred_time } = req.body;

  const sql = `UPDATE meeting_requests SET status = 'Rescheduled', preferred_date = ?, preferred_time = ? WHERE id = ?`;
  db.query(sql, [preferred_date, preferred_time, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    const getSql = `SELECT mr.*, u.email, u.name FROM meeting_requests mr JOIN users u ON u.id = mr.requester_id WHERE mr.id = ?`;
    db.query(getSql, [id], async (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true, message: 'Rescheduled', data: null });
      const req2 = results[0];
      db.query(`INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`,
        [uuidv4(), req2.requester_id, `Your meeting request has been rescheduled to ${preferred_date} at ${preferred_time}`, 'meeting_rescheduled']);
      try {
        await sendMeetingRescheduledEmail(req2.email, req2.name, req2.purpose, preferred_date, preferred_time);
      } catch (emailErr) { console.log('Reschedule email failed:', emailErr.message); }
      res.json({ success: true, message: 'Request rescheduled', data: null });
    });
  });
};

// GET MY REQUESTS (Staff)
const getMyRequests = (req, res) => {
  const requester_id = req.user.id;

  const sql = `SELECT * FROM meeting_requests WHERE requester_id = ? ORDER BY created_at DESC`;

  db.query(sql, [requester_id], (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Your requests fetched', data: results });
  });
};

// ADD INTERNAL NOTES (Secretary)
const addInternalNotes = (req, res) => {
  const { id } = req.params;
  const { internal_notes } = req.body;

  const sql = `UPDATE meeting_requests SET internal_notes = ? WHERE id = ?`;

  db.query(sql, [internal_notes, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Internal notes saved', data: null });
  });
};

module.exports = { upload, submitRequest, getAllRequests, approveRequest, rejectRequest, rescheduleRequest, getMyRequests, addInternalNotes };