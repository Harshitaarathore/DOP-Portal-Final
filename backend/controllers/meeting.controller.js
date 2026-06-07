const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const logAudit = (user_id, action, module) => {
  const { v4: uuidv4 } = require('uuid');
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

  db.query(sql, [id, requester_id, purpose, priority, preferred_date, preferred_time, requester_name || '', department || '', attachment], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Meeting request submitted', data: null });
  });
};


// GET ALL REQUESTS (Secretary)
const getAllRequests = (req, res) => {
  const { status, priority } = req.query;

  let sql = `SELECT * FROM meeting_requests WHERE 1=1`;
  const params = [];

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  if (priority) {
    sql += ` AND priority = ?`;
    params.push(priority);
  }

  sql += ` ORDER BY created_at DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Requests fetched', data: results });
  });
};

// APPROVE REQUEST (Director only)
const approveRequest = (req, res) => {
  const { id } = req.params;
  const { v4: uuidv4 } = require('uuid');

  const sql = `UPDATE meeting_requests SET status = 'Approved' WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // get requester_id to send notification
    const getSql = `SELECT requester_id FROM meeting_requests WHERE id = ?`;
    db.query(getSql, [id], (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true, message: 'Request approved', data: null });
      
      logAudit(req.user.id, 'APPROVED meeting request', 'Meetings');

      const notifId = uuidv4();
      const notifSql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
      db.query(notifSql, [notifId, results[0].requester_id, 'Your meeting request has been approved', 'meeting_approved']);

      res.json({ success: true, message: 'Request approved and notification sent', data: null });
    });
  });
};

// REJECT REQUEST (Director only)
const rejectRequest = (req, res) => {
  const { id } = req.params;
  const { v4: uuidv4 } = require('uuid');

  const sql = `UPDATE meeting_requests SET status = 'Rejected' WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // get requester_id to send notification
    const getSql = `SELECT requester_id FROM meeting_requests WHERE id = ?`;
    db.query(getSql, [id], (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true, message: 'Request rejected', data: null });

      logAudit(req.user.id, 'REJECTED meeting request', 'Meetings');

      const notifId = uuidv4();
      const notifSql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
      db.query(notifSql, [notifId, results[0].requester_id, 'Your meeting request has been rejected', 'meeting_rejected']);

      res.json({ success: true, message: 'Request rejected and notification sent', data: null });
    });
  });
};

// RESCHEDULE REQUEST (Secretary)
const rescheduleRequest = (req, res) => {
  const { id } = req.params;
  const { preferred_date, preferred_time } = req.body;

  const sql = `UPDATE meeting_requests SET status = 'Rescheduled', preferred_date = ?, preferred_time = ? WHERE id = ?`;

  db.query(sql, [preferred_date, preferred_time, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Request rescheduled', data: null });
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