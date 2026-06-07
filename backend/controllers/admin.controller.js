const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// GET ALL PERMISSIONS
const getPermissions = (req, res) => {
  const sql = `SELECT * FROM roles_permissions ORDER BY role ASC, module_name ASC`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Permissions fetched', data: results });
  });
};

// UPDATE PERMISSION
const updatePermission = (req, res) => {
  const { id } = req.params;
  const { can_view, can_edit, can_delete, can_approve } = req.body;

  const sql = `UPDATE roles_permissions SET can_view=?, can_edit=?, can_delete=?, can_approve=? WHERE id=?`;
  db.query(sql, [can_view, can_edit, can_delete, can_approve, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Permission updated', data: null });
  });
};

// GET ALL DEPARTMENTS
const getDepartments = (req, res) => {
  const sql = `SELECT * FROM departments ORDER BY name ASC`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Departments fetched', data: results });
  });
};

// ADD DEPARTMENT
const addDepartment = (req, res) => {
  const { name, head } = req.body;
  if (!name) return res.json({ success: false, message: 'Department name required', data: null });

  const id = uuidv4();
  const sql = `INSERT INTO departments (id, name, head) VALUES (?, ?, ?)`;
  db.query(sql, [id, name, head || ''], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Department added', data: null });
  });
};

// UPDATE DEPARTMENT STATUS
const updateDepartmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE departments SET status=? WHERE id=?`;
  db.query(sql, [status, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Department updated', data: null });
  });
};

// DELETE DEPARTMENT
const deleteDepartment = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM departments WHERE id=?`;
  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Department deleted', data: null });
  });
};

module.exports = { getPermissions, updatePermission, getDepartments, addDepartment, updateDepartmentStatus, deleteDepartment };