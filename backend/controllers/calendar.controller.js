const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// CREATE EVENT (Secretary)
const createEvent = (req, res) => {
  const { title, description, start_time, end_time, type, visibility, notes, participants } = req.body;
  const created_by = req.user.id;
  const id = uuidv4();

  if (!title || !title.trim()) {
    return res.json({ success: false, message: 'Event title is required', data: null });
  }

  const conflictSql = `SELECT * FROM events WHERE (start_time < ? AND end_time > ?)`;

  db.query(conflictSql, [end_time, start_time], (err, conflicts) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const conflictStart = new Date(conflict.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      const conflictEnd = new Date(conflict.end_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      return res.json({ 
        success: false, 
        message: `Time conflict with "${conflict.title}" (${conflictStart} – ${conflictEnd})`, 
        data: null 
      });
    }

    const sql = `INSERT INTO events (id, title, description, start_time, end_time, type, visibility, created_by, notes, participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

db.query(sql, [id, title, description, start_time, end_time, type, visibility, created_by, notes, participants ? JSON.stringify(participants) : null], (err2) => {
  if (err2) return res.json({ success: false, message: err2.message, data: null });

  console.log('Event created, sending notifications...');
  
  const { v4: uuidv4notify } = require('uuid');
  const eventDate = new Date(start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  
  // Send to ALL active users
  db.query(`SELECT id FROM users WHERE status = 'active'`, (err3, users) => {
    console.log('Users found for notification:', users?.length, err3?.message);
    if (!err3 && users && users.length > 0) {
      users.forEach(u => {
        const nid = uuidv4notify();
        db.query(
          `INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, ?)`,
          [nid, u.id, `📅 New Event: "${title}" on ${eventDate}`, 'event', 0],
          (err4) => { 
            if (err4) console.log('Event notif insert error:', err4.message); 
            else console.log('Event notif inserted for:', u.id);
          }
        );
      });
    }
  });

  res.json({ success: true, message: 'Event created', data: null });
});
  });
};



// GET FULL EVENTS (Director + Secretary)
const getFullEvents = (req, res) => {
  const sql = `SELECT * FROM events ORDER BY start_time ASC`;

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Events fetched', data: results });
  });
};

// GET PUBLIC EVENTS (Staff) - no confidential events, no notes
const getPublicEvents = (req, res) => {
  const sql = `SELECT id, title, start_time, end_time, type FROM events WHERE type != 'Confidential' ORDER BY start_time ASC`;

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Public events fetched', data: results });
  });
};

// EDIT EVENT (Secretary)
const editEvent = (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, type, visibility, notes, participants } = req.body;

  const sql = `UPDATE events SET title=?, description=?, start_time=?, end_time=?, type=?, visibility=?, notes=?, participants=? WHERE id=?`;

  db.query(sql, [title, description, start_time, end_time, type, visibility, notes, participants ? JSON.stringify(participants) : null, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Event updated', data: null });
  });
};


// DELETE EVENT (Secretary)
const deleteEvent = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM events WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Event deleted', data: null });
  });
};

module.exports = { createEvent, getFullEvents, getPublicEvents, editEvent, deleteEvent };