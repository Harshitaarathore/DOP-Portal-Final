const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { upload, submitRequest, getAllRequests, approveRequest, rejectRequest, rescheduleRequest, getMyRequests, addInternalNotes } = require('../controllers/meeting.controller');

router.post('/request', verifyToken, upload.single('attachment'), submitRequest);
router.get('/all', verifyToken, allowRoles('Secretary', 'Director'), getAllRequests);
router.put('/:id/approve', verifyToken, allowRoles('Director'), approveRequest);
router.put('/:id/reject', verifyToken, allowRoles('Director'), rejectRequest);
router.put('/:id/reschedule', verifyToken, allowRoles('Secretary'), rescheduleRequest);
router.get('/my', verifyToken, getMyRequests);
router.put('/:id/notes', verifyToken, allowRoles('Secretary', 'Director'), addInternalNotes);

module.exports = router;