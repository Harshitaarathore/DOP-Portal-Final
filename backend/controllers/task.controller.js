const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// CREATE TASK
const createTask = (req, res) => {
  const { title, description, assigned_to, deadline, priority } = req.body;
  const id = uuidv4();

  const sql = `INSERT INTO tasks (id, title, description, assigned_to, deadline, priority) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, title, description, assigned_to, deadline, priority], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Task created', data: null });
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

  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;

  db.query(sql, [status, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
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