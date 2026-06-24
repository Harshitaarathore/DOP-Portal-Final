const express = require('express');
const router = express.Router();
const { getCommunications, createCommunication, updateStatus, deleteCommunication } = require('../controllers/communication.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles, checkPermission } = require('../middleware/role.middleware');

router.get('/', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Communication', 'view'), getCommunications);
router.post('/', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Communication', 'edit'), createCommunication);
router.put('/:id/status', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Communication', 'edit'), updateStatus);
router.delete('/:id', verifyToken, allowRoles('Director'), checkPermission('Communication', 'delete'), deleteCommunication);

module.exports = router;