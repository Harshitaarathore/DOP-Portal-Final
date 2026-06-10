const express = require('express');
const router = express.Router();
const { getCommunications, createCommunication, updateStatus, deleteCommunication } = require('../controllers/communication.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.get('/', verifyToken, allowRoles('Secretary', 'Director'), getCommunications);
router.post('/', verifyToken, allowRoles('Secretary', 'Director'), createCommunication);
router.put('/:id/status', verifyToken, allowRoles('Secretary', 'Director'), updateStatus);
router.delete('/:id', verifyToken, allowRoles('Director'), deleteCommunication);

module.exports = router;