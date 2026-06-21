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

  if (!name || !purpose || !visit_date || !visit_time) {
    return res.json({ success: false, message: 'Name, purpose, date and time are required', data: null });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visitD = new Date(visit_date);
  if (visitD < today) {
    return res.json({ success: false, message: 'Visit date cannot be in the past', data: null });
  }

  // If this request came from a logged-in Staff user (token decoded by optionalAuth),
  // look up their email and stamp it as invited_by. Public/no-login submissions
  // (e.g. the external VisitorRegister page) have no req.user, so invited_by stays NULL.
  const finishSubmit = (invited_by) => {
    // Check time clash
    const clashSql = `SELECT * FROM visitors WHERE visit_date = ? AND visit_time = ? AND approval_status != 'Rejected'`;
    db.query(clashSql, [visit_date, visit_time], (err, clashes) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      if (clashes.length > 0) {
        return res.json({ 
          success: false, 
          message: `Time slot ${visit_time} on this date is already booked by "${clashes[0].name}". Please choose a different time.`, 
          data: null 
        });
      }

      const id = uuidv4();
      const sql = `INSERT INTO visitors (id, name, email, organization, purpose, visit_date, visit_time, invited_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      db.query(sql, [id, name, email || '', organization, purpose, visit_date, visit_time || '10:00', invited_by || null], (err2) => {
        if (err2) return res.json({ success: false, message: err2.message, data: null });
        
        // Send notification to Secretary and Director
        const notifSql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
        db.query(`SELECT id FROM users WHERE role IN ('Director', 'Secretary') AND status = 'active'`, (err3, users) => {
          if (!err3 && users && users.length > 0) {
            const visitDateStr = new Date(visit_date).toLocaleDateString('en-IN', { dateStyle: 'medium' });
            users.forEach(u => {
              db.query(notifSql, [uuidv4(), u.id, `👤 New Visitor Request: "${name}" from ${organization} on ${visitDateStr}`, 'visitor_added']);
            });
          }
        });
        
        res.json({ success: true, message: 'Visitor request submitted', data: null });
      });
    });
  };

  if (req.user && req.user.id) {
    // Logged-in caller (Staff, via JWT decoded by optionalAuth middleware) — look up their email
    db.query(`SELECT email FROM users WHERE id = ?`, [req.user.id], (errLookup, rows) => {
      if (errLookup || !rows.length) return finishSubmit(null);
      finishSubmit(rows[0].email);
    });
  } else {
    // No token — public submission (e.g. VisitorRegister page)
    finishSubmit(null);
  }
};

// GET MY VISITORS — for Staff: visitors they invited (invited_by). For Visitor role: their own appointments (matched by email).
const getMyVisitors = (req, res) => {
  if (req.user.role === 'Visitor') {
    const sql = `SELECT * FROM visitors WHERE email = (SELECT email FROM users WHERE id = ?) ORDER BY visit_date DESC`;
    db.query(sql, [req.user.id], (err, results) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      res.json({ success: true, message: 'Your appointments fetched', data: results });
    });
  } else {
    const sql = `SELECT * FROM visitors WHERE invited_by = (SELECT email FROM users WHERE id = ?) ORDER BY visit_date DESC`;
    db.query(sql, [req.user.id], (err, results) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      res.json({ success: true, message: 'Your invited visitors fetched', data: results });
    });
  }
};

// GET ALL VISITORS (Secretary)
const getTodayVisitors = (req, res) => {
  const sql = `SELECT * FROM visitors ORDER BY visit_date DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Visitors fetched', data: results });
  });
};

// APPROVE VISITOR (Secretary)
const approveVisitor = async (req, res) => {
  const { id } = req.params;

  // Get visitor details first
  db.query(`SELECT * FROM visitors WHERE id = ?`, [id], async (err, rows) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    if (!rows.length) return res.json({ success: false, message: 'Visitor not found', data: null });

    const visitor = rows[0];

    // Check if another visitor already approved for same date+time
    const clashSql = `SELECT * FROM visitors WHERE visit_date = ? AND visit_time = ? AND approval_status = 'Approved' AND id != ?`;
    db.query(clashSql, [visitor.visit_date, visitor.visit_time, id], async (err2, clashes) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      if (clashes.length > 0) {
        return res.json({ 
          success: false, 
          message: `Cannot approve — "${clashes[0].name}" is already approved for this time slot`, 
          data: null 
        });
      }

      // No clash — proceed with approval
      const updateSql = `UPDATE visitors SET approval_status = 'Approved', pass_generated = 1 WHERE id = ?`;
      db.query(updateSql, [id], async (err3) => {
        if (err3) return res.json({ success: false, message: err3.message, data: null });
        logAudit(req.user.id, 'APPROVED visitor', 'Visitors');

        // Send notification to all active users when pass is generated
        const notifSql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
        db.query(`SELECT id FROM users WHERE status = 'active'`, (err4, users) => {
          if (!err4 && users && users.length > 0) {
            const visitDateStr = new Date(visitor.visit_date).toLocaleDateString('en-IN', { dateStyle: 'medium' });
            users.forEach(u => {
              db.query(notifSql, [uuidv4(), u.id, `🎫 Visitor Pass Generated: "${visitor.name}" from ${visitor.organization} on ${visitDateStr}`, 'visitor_pass_generated']);
            });
          }
        });

        const rawDate = new Date(visitor.visit_date);
        rawDate.setDate(rawDate.getDate() + 1);
        const dateStr = rawDate.toISOString().split('T')[0];

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

        const eventId = uuidv4();
        const eventSql = `INSERT INTO events (id, title, description, start_time, end_time, type, visibility, created_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(eventSql, [
          eventId,
          `Visitor: ${visitor.name}`,
          `Visit from ${visitor.organization} — ${visitor.purpose}`,
          startTime, endTime, 'Public', 'public', req.user.id,
          `Organization: ${visitor.organization}`
        ], async (err5) => {
          if (err5) console.log('Event creation failed:', err5.message);

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

module.exports = { submitVisitor, getTodayVisitors, approveVisitor, rejectVisitor, getMyVisitors };