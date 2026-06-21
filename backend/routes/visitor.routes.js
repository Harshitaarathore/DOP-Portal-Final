const express = require('express');
const router = express.Router();
const { submitVisitor, getTodayVisitors, approveVisitor, rejectVisitor, getMyVisitors } = require('../controllers/visitor.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.post('/request', optionalAuth, submitVisitor);
router.get('/my', verifyToken, getMyVisitors);
router.get('/today', verifyToken, allowRoles('Secretary', 'Director'), getTodayVisitors);
router.put('/:id/approve', verifyToken, allowRoles('Secretary', 'Director'), approveVisitor);
router.put('/:id/reject', verifyToken, allowRoles('Secretary', 'Director'), rejectVisitor);

module.exports = router;