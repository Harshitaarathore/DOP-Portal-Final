const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const logAudit = (user_id, action, module) => {
  const { v4: uuidv4 } = require('uuid');
  const sql = `INSERT INTO audit_logs (id, user_id, action, module) VALUES (?, ?, ?, ?)`;
  db.query(sql, [uuidv4(), user_id, action, module], (err) => {
    if (err) console.log('Audit log error:', err.message);
  });
};

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// UPLOAD DOCUMENT
const uploadDocument = (req, res) => {
  const { title, category, access_level, version } = req.body;
  const uploaded_by = req.user.id;
  const file_path = req.file ? req.file.filename : null;
  const id = uuidv4();

  const sql = `INSERT INTO documents (id, title, category, file_path, uploaded_by, access_level, version) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id, title, category, file_path, uploaded_by, access_level, version || '1.0'], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    logAudit(req.user.id, 'UPLOADED document: ' + title, 'Documents');
    res.json({ success: true, message: 'Document uploaded', data: null });
  });
};

// GET ALL DOCUMENTS
const getDocuments = (req, res) => {
  const role = req.user.role;
  let sql;

  if (role === 'Staff') {
    sql = `SELECT * FROM documents WHERE access_level = 'public' ORDER BY upload_date DESC`;
  } else {
    sql = `SELECT * FROM documents ORDER BY upload_date DESC`;
  }

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Documents fetched', data: results });
  });
};

// DELETE DOCUMENT
const deleteDocument = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM documents WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    logAudit(req.user.id, 'DELETED document', 'Documents');
    res.json({ success: true, message: 'Document deleted', data: null });
  });
};

// ADD NEW VERSION
const addVersion = (req, res) => {
  const { id } = req.params;
  const { version, notes } = req.body;
  const uploaded_by = req.user.id;
  const file_path = req.file ? req.file.filename : null;
  const versionId = uuidv4();

  // update main document version
  const updateSql = `UPDATE documents SET version = ?, file_path = ? WHERE id = ?`;
  db.query(updateSql, [version, file_path || null, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    // insert version history record
    const sql = `INSERT INTO document_versions (id, document_id, version, file_path, uploaded_by, notes) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(sql, [versionId, id, version, file_path, uploaded_by, notes || ''], (err2) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      res.json({ success: true, message: 'New version uploaded', data: null });
    });
  });
};

// GET VERSION HISTORY
const getVersionHistory = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM document_versions WHERE document_id = ? ORDER BY upload_date DESC`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Version history fetched', data: results });
  });
};

module.exports = { upload, uploadDocument, getDocuments, deleteDocument, addVersion, getVersionHistory };