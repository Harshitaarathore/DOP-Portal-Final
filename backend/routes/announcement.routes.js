const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, togglePin, deleteAnnouncement } = require('../controllers/announcement.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.get('/', verifyToken, getAnnouncements);
router.post('/', verifyToken, allowRoles('Secretary', 'Director'), createAnnouncement);
router.put('/:id/pin', verifyToken, allowRoles('Secretary', 'Director'), togglePin);
router.delete('/:id', verifyToken, allowRoles('Secretary', 'Director'), deleteAnnouncement);

module.exports = router;