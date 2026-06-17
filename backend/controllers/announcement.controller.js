const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const getAnnouncements = (req, res) => {
  db.query(`SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC`, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Announcements fetched', data: results });
  });
};

const createAnnouncement = (req, res) => {
  const { title, content, priority, category, pinned } = req.body;
  const author = req.user.name || req.user.email;
  const id = uuidv4();
  db.query(
    `INSERT INTO announcements (id, title, content, priority, category, author, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, title, content, priority || 'Medium', category || 'General', author, pinned ? 1 : 0],
    (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });

      // Notify all users
      db.query(`SELECT id FROM users`, (err2, users) => {
        if (!err2) {
          users.forEach(u => {
            db.query(
              `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`,
              [uuidv4(), u.id, `New announcement: ${title}`, 'announcement']
            );
          });
        }
      });

      res.json({ success: true, message: 'Announcement created', data: null });
    }
  );
};

const togglePin = (req, res) => {
  const { id } = req.params;
  db.query(`UPDATE announcements SET pinned = NOT pinned WHERE id = ?`, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Pin toggled', data: null });
  });
};

const deleteAnnouncement = (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM announcements WHERE id = ?`, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Deleted', data: null });
  });
};

module.exports = { getAnnouncements, createAnnouncement, togglePin, deleteAnnouncement };