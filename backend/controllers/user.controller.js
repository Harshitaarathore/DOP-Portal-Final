const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// GET ALL USERS
const getAllUsers = (req, res) => {
  db.query(`SELECT id, name, role FROM users WHERE status = 'active' ORDER BY role, name`, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Users fetched', data: results });
  });
};

// ADD NEW USER
const addUser = (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role) {
    return res.json({ success: false, message: 'Name, email, password and role are required', data: null });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = uuidv4();

  const sql = `INSERT INTO users (id, name, email, password, role, department, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`;

  db.query(sql, [id, name, email, hashedPassword, role, department || ''], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: 'Email already exists', data: null });
      return res.json({ success: false, message: err.message, data: null });
    }
    res.json({ success: true, message: 'User added successfully', data: null });
  });
};

// UPDATE USER STATUS (activate/deactivate)
const updateUserStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE users SET status = ? WHERE id = ?`;

  db.query(sql, [status, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: `User ${status}`, data: null });
  });
};

// UPDATE USER ROLE
const updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role, department } = req.body;

  const sql = `UPDATE users SET role = ?, department = ? WHERE id = ?`;

  db.query(sql, [role, department, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'User updated', data: null });
  });
};

// DELETE USER
const deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM users WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'User deleted', data: null });
  });
};

module.exports = { getAllUsers, addUser, updateUserStatus, updateUserRole, deleteUser };