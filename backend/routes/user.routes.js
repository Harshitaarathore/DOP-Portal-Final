const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { getAllUsers, addUser, updateUserStatus, updateUserRole, deleteUser } = require('../controllers/user.controller');

router.get('/', verifyToken, getAllUsers);

// NOTIFICATIONS
router.get('/notifications', verifyToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Notifications fetched', data: results });
  });
});

router.put('/notifications/read-all', verifyToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `UPDATE notifications SET read_status = 1 WHERE user_id = ?`;
  db.query(sql, [user_id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'All notifications marked as read', data: null });
  });
});

router.put('/notifications/:id/read', verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE notifications SET read_status = 1 WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Notification marked as read', data: null });
  });
});

// ANNOUNCEMENTS
router.get('/announcements', verifyToken, (req, res) => {
  const sql = `SELECT * FROM announcements WHERE status = 'active' ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Announcements fetched', data: results });
  });
});

router.post('/announcements', verifyToken, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.json({ success: false, message: 'Title and content required', data: null });
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();
  const sql = `INSERT INTO announcements (id, title, content, created_by) VALUES (?, ?, ?, ?)`;
  db.query(sql, [id, title, content, req.user.id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // Send notification to ALL active users
    const notifSql = `SELECT id FROM users WHERE status = 'active'`;
    db.query(notifSql, (err2, users) => {
      if (!err2 && users.length > 0) {
         users.forEach(u => {
          const notifId = uuidv4();
          db.query(
            `INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, ?)`,
            [notifId, u.id, `📢 New Announcement: ${title}`, 'announcement', 0],
            (err3) => { if (err3) console.log('Notif insert error:', err3.message); }
          );
        });
      }
    });
    res.json({ success: true, message: 'Announcement created', data: null });
  });
});

router.delete('/announcements/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = `UPDATE announcements SET status = 'inactive' WHERE id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Announcement removed', data: null });
  });
});

// AUDIT LOGS
router.get('/audit-logs', verifyToken, allowRoles('Secretary', 'Director'), (req, res) => {
  const sql = `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Audit logs fetched', data: results });
  });
});

// USER MANAGEMENT — MUST BE LAST (/:id catches everything above if placed first)
router.get('/all', verifyToken, allowRoles('Secretary', 'Director'), getAllUsers);
router.post('/add', verifyToken, allowRoles('Secretary', 'Director'), addUser);
router.put('/:id/status', verifyToken, allowRoles('Secretary', 'Director'), updateUserStatus);
router.put('/:id/role', verifyToken, allowRoles('Secretary', 'Director'), updateUserRole);
router.delete('/:id', verifyToken, allowRoles('Director'), deleteUser);

module.exports = router;