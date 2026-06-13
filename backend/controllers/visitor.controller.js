const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendVisitorApprovedEmail } = require('../utils/email');

const logAudit = (user_id, action, module) => {
  const { v4: uuidv4 } = require('uuid');
  const sql = `INSERT INTO audit_logs (id, user_id, action, module) VALUES (?, ?, ?, ?)`;
  db.query(sql, [uuidv4(), user_id, action, module], (err) => {
    if (err) console.log('Audit log error:', err.message);
  });
};

// SUBMIT VISITOR REQUEST
const submitVisitor = (req, res) => {
  const { name, email, organization, purpose, visit_date, visit_time } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitD = new Date(visit_date);
  if (visitD < today) {
    return res.json({ success: false, message: 'Visit date cannot be in the past', data: null });
  }

  const id = uuidv4();
  const sql = `INSERT INTO visitors (id, name, email, organization, purpose, visit_date, visit_time) VALUES (?, ?, ?, ?, ?, ?, ?)`;

db.query(sql, [id, name, email || '', organization, purpose, visit_date, visit_time || '10:00'], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Visitor request submitted', data: null });
  });
};

// GET ALL VISITORS (Secretary)
const getTodayVisitors = (req, res) => {
  const sql = `SELECT * FROM visitors ORDER BY visit_date ASC`;

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Visitors fetched', data: results });
  });
};

// APPROVE VISITOR (Secretary)
const approveVisitor = async (req, res) => {
  const { id } = req.params;

  const updateSql = `UPDATE visitors SET approval_status = 'Approved', pass_generated = 1 WHERE id = ?`;

  db.query(updateSql, [id], async (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    logAudit(req.user.id, 'APPROVED visitor', 'Visitors');

    const getSql = `SELECT * FROM visitors WHERE id = ?`;

    db.query(getSql, [id], async (err2, results) => {
      if (err2 || results.length === 0) return res.json({ success: true, message: 'Visitor approved', data: null });

      const visitor = results[0];
      const eventId = uuidv4();

      const rawDate = new Date(visitor.visit_date);
      rawDate.setDate(rawDate.getDate() + 1);
      const dateStr = rawDate.toISOString().split('T')[0];

      // Convert 12hr to 24hr format
      const convertTo24Hr = (time12) => {
        if (!time12) return '10:00';
        if (!time12.includes('AM') && !time12.includes('PM')) return time12;
        const [time, modifier] = time12.split(' ');
          let [hours, minutes] = time.split(':');
          if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours) + 12);
          if (modifier === 'AM' && hours === '12') hours = '00';
          return `${hours.padStart(2,'0')}:${minutes}`;
      };
      const visitTime = convertTo24Hr(visitor.visit_time);
      const endHour = String(parseInt(visitTime.split(':')[0]) + 1).padStart(2, '0');
      const endMin = visitTime.split(':')[1];
      const startTime = `${dateStr} ${visitTime}:00`;
      const endTime = `${dateStr} ${endHour}:${endMin}:00`;

      const eventSql = `INSERT INTO events (id, title, description, start_time, end_time, type, visibility, created_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(eventSql, [
        eventId,
        `Visitor: ${visitor.name}`,
        `Visit from ${visitor.organization} — ${visitor.purpose}`,
        startTime,
        endTime,
        'Public',
        'public',
        req.user.id,
        `Organization: ${visitor.organization}`
      ], async (err3) => {
        if (err3) console.log('Event creation failed:', err3.message);

        // Send approval email
        if (visitor.email) {
          try {
            await sendVisitorApprovedEmail(visitor.email, visitor.name, visitor.organization, visitor.visit_date, visitor.visit_time);
          } catch (emailErr) {
            console.log('Visitor approval email failed:', emailErr.message);
          }
        }

        res.json({ success: true, message: 'Visitor approved and calendar event created', data: null });
      });
    });
  });
};
// REJECT VISITOR (Secretary)
const rejectVisitor = (req, res) => {
  const { id } = req.params;

  const sql = `UPDATE visitors SET approval_status = 'Rejected' WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    logAudit(req.user.id, 'REJECTED visitor', 'Visitors');
    res.json({ success: true, message: 'Visitor rejected', data: null });
  });
};

module.exports = { submitVisitor, getTodayVisitors, approveVisitor, rejectVisitor };