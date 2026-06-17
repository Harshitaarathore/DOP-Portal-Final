 const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET ALL COMMUNICATIONS
const getCommunications = (req, res) => {
  const { status, type, direction } = req.query;
  let sql = `SELECT * FROM communications WHERE 1=1`;
  const params = [];

  if (status) { sql += ` AND status = ?`; params.push(status); }
  if (type) { sql += ` AND type = ?`; params.push(type); }
  if (direction) { sql += ` AND direction = ?`; params.push(direction); }

  sql += ` ORDER BY date DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Communications fetched', data: results });
  });
};

// CREATE COMMUNICATION
const createCommunication = (req, res) => {
  const { type, sender, subject, content, tagged_as, direction } = req.body;
  const id = uuidv4();
  const assigned_to = req.user.id;

  const sql = `INSERT INTO communications (id, type, sender, subject, content, assigned_to, tagged_as, direction) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, type, sender, subject, content, assigned_to, tagged_as || '', direction || 'inward'], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // Notify Director and Secretary
    const notifSql = `SELECT id FROM users WHERE role IN ('Director', 'Secretary') AND status = 'active'`;
    db.query(notifSql, (err2, users) => {
      if (!err2 && users.length > 0) {
        users.forEach(u => {
          db.query(
            `INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, ?)`,
            [uuidv4(), u.id, `📬 New ${direction || 'inward'} ${type}: "${subject}" from ${sender}`, 'communication', 0],
            (err3) => { if (err3) console.log('Comm notif error:', err3.message); }
          );
        });
      }
    });

    res.json({ success: true, message: 'Communication logged', data: null });
  });
};

// UPDATE STATUS
const updateStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE communications SET status = ? WHERE id = ?`;

  db.query(sql, [status, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Status updated', data: null });
  });
};

// DELETE COMMUNICATION
const deleteCommunication = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM communications WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Communication deleted', data: null });
  });
};

module.exports = { getCommunications, createCommunication, updateStatus, deleteCommunication };