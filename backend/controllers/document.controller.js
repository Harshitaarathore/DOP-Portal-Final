const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer now stores to Cloudinary instead of local disk
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isImage = ['jpg','jpeg','png','gif','webp'].includes(ext);
    return {
      folder: 'dop-portal/documents',
      resource_type: isImage ? 'image' : 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
      // For raw files, force download=false so browser opens them inline
      flags: isImage ? undefined : 'attachment:false',
    };
  },
});

const upload = multer({ storage });

const logAudit = (user_id, action, module) => {
  const sql = `INSERT INTO audit_logs (id, user_id, action, module) VALUES (?, ?, ?, ?)`;
  db.query(sql, [uuidv4(), user_id, action, module], (err) => {
    if (err) console.log('Audit log error:', err.message);
  });
};

// UPLOAD DOCUMENT
const uploadDocument = (req, res) => {
  const { title, category, access_level, version } = req.body;
  const uploaded_by = req.user.id;
  const file_path = req.file ? req.file.path : null;
  const id = uuidv4();
  const initialVersion = version || '1.0';

  // Check for duplicate title first
  db.query(`SELECT id FROM documents WHERE title = ?`, [title], (err, existing) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    if (existing.length > 0) {
      return res.json({ success: false, message: `A document named "${title}" already exists. Use "New Version" to update it.`, data: null });
    }

    const sql = `INSERT INTO documents (id, title, category, file_path, uploaded_by, access_level, version) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [id, title, category, file_path, uploaded_by, access_level, initialVersion], (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });

      const versionSql = `INSERT INTO document_versions (id, document_id, version, file_path, uploaded_by, notes) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(versionSql, [uuidv4(), id, initialVersion, file_path, uploaded_by, 'Initial upload'], (err2) => {
        if (err2) console.log('Version history insert error:', err2.message);
      });

      // Send notification to all active users
      const notifSql = `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)`;
      db.query(`SELECT id FROM users WHERE status = 'active'`, (err3, users) => {
        if (!err3 && users && users.length > 0) {
          users.forEach(u => {
            db.query(notifSql, [uuidv4(), u.id, `📄 New Document: "${title}" (${category}) uploaded`, 'document_uploaded']);
          });
        }
      });

      logAudit(req.user.id, 'UPLOADED document: ' + title, 'Documents');
      res.json({ success: true, message: 'Document uploaded successfully', data: null });
    });
  });
};

// GET ALL DOCUMENTS
const getDocuments = (req, res) => {
  const role = req.user.role;
  const sql = role === 'Staff'
    ? `SELECT * FROM documents WHERE access_level = 'public' ORDER BY upload_date DESC`
    : `SELECT * FROM documents ORDER BY upload_date DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Documents fetched', data: results });
  });
};

// DELETE DOCUMENT
const deleteDocument = (req, res) => {
  const { id } = req.params;

  // Delete versions first to avoid foreign key constraint issues
  db.query(`DELETE FROM document_versions WHERE document_id = ?`, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

    db.query(`DELETE FROM documents WHERE id = ?`, [id], (err2) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      logAudit(req.user.id, 'DELETED document', 'Documents');
      res.json({ success: true, message: 'Document deleted', data: null });
    });
  });
};

// ADD NEW VERSION
const addVersion = (req, res) => {
  const { id } = req.params;
  const { version, notes } = req.body;
  const uploaded_by = req.user.id;

  // Cloudinary URL for this version's file
  const file_path = req.file ? req.file.path : null;
  const versionId = uuidv4();

  const updateSql = `UPDATE documents SET version = ?, file_path = ? WHERE id = ?`;
  db.query(updateSql, [version, file_path, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });

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
  db.query(
    `SELECT * FROM document_versions WHERE document_id = ? ORDER BY upload_date DESC`,
    [id],
    (err, results) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      res.json({ success: true, message: 'Version history fetched', data: results });
    }
  );
};

module.exports = { upload, uploadDocument, getDocuments, deleteDocument, addVersion, getVersionHistory };