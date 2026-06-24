const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles, checkPermission } = require('../middleware/role.middleware');
const { upload, submitRequest, getAllRequests, approveRequest, rejectRequest, rescheduleRequest, getMyRequests, addInternalNotes } = require('../controllers/meeting.controller');

router.post('/request', verifyToken, upload.single('attachment'), submitRequest);
router.get('/all', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Requests', 'view'), getAllRequests);
router.put('/:id/approve', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Requests', 'approve'), approveRequest);
router.put('/:id/reject', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Requests', 'approve'), rejectRequest);
router.put('/:id/reschedule', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Requests', 'edit'), rescheduleRequest);
router.get('/my', verifyToken, getMyRequests);
router.put('/:id/notes', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Requests', 'edit'), addInternalNotes);

module.exports = router;