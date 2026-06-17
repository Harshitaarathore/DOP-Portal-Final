const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// CREATE TASK
const createTask = (req, res) => {
  const { title, description, assigned_to, deadline, priority } = req.body;

  if (!title || !title.trim()) {
    return res.json({ success: false, message: 'Task title is required', data: null });
  }

  const id = uuidv4();
  const sql = `INSERT INTO tasks (id, title, description, assigned_to, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, title, description || '', assigned_to || '', deadline || null, priority || 'Low'], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // Notify Director and Secretary
    const notifSql = `SELECT id FROM users WHERE role IN ('Director', 'Secretary') AND status = 'active'`;
    db.query(notifSql, (err2, users) => {
      if (!err2 && users.length > 0) {
        const deadlineStr = deadline ? ` (due ${new Date(deadline).toLocaleDateString('en-IN')})` : '';
        users.forEach(u => {
          db.query(
            `INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, ?)`,
            [uuidv4(), u.id, `✅ New Task: "${title}"${deadlineStr} — Priority: ${priority || 'Low'}`, 'task', 0],
            (err3) => { if (err3) console.log('Task notif error:', err3.message); }
          );
        });
      }
    });

    res.json({ success: true, message: 'Task created', data: { id } });
  });
};

// GET ALL TASKS (Kanban data)
const getAllTasks = (req, res) => {
  const sql = `SELECT * FROM tasks ORDER BY created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // group by status for kanban
    const kanban = {
      Pending: results.filter(t => t.status === 'Pending'),
      'In Progress': results.filter(t => t.status === 'In Progress'),
      Completed: results.filter(t => t.status === 'Completed')
    };

    res.json({ success: true, message: 'Tasks fetched', data: kanban });
  });
};

// UPDATE TASK STATUS
const updateTaskStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
    return res.json({ success: false, message: 'Invalid status', data: null });
  }

  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;

  db.query(sql, [status, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    if (status === 'Completed') {
      db.query(`SELECT title FROM tasks WHERE id = ?`, [id], (err2, rows) => {
        if (!err2 && rows.length > 0) {
          db.query(`SELECT id FROM users WHERE role IN ('Director', 'Secretary') AND status = 'active'`, (err3, users) => {
            if (!err3 && users.length > 0) {
              users.forEach(u => {
                db.query(
                  `INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, ?)`,
                  [uuidv4(), u.id, `✅ Task Completed: "${rows[0].title}"`, 'task', 0]
                );
              });
            }
          });
        }
      });
    }

    res.json({ success: true, message: 'Task status updated', data: null });
  });
};

// DELETE TASK
const deleteTask = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM tasks WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Task deleted', data: null });
  });
};

module.exports = { createTask, getAllTasks, updateTaskStatus, deleteTask };