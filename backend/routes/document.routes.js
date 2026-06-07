const express = require('express');
const router = express.Router();
const { upload, uploadDocument, getDocuments, deleteDocument, addVersion, getVersionHistory } = require('../controllers/document.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.post('/upload', verifyToken, allowRoles('Secretary', 'Director'), upload.single('file'), uploadDocument);
router.get('/', verifyToken, getDocuments);
router.delete('/:id', verifyToken, allowRoles('Secretary', 'Director'), deleteDocument);
router.post('/:id/version', verifyToken, allowRoles('Secretary', 'Director'), upload.single('file'), addVersion);
router.get('/:id/versions', verifyToken, getVersionHistory);

module.exports = router;