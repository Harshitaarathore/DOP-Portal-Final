const express = require('express');
const router = express.Router();
const { createEvent, getFullEvents, getPublicEvents, editEvent, deleteEvent } = require('../controllers/calendar.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.post('/', verifyToken, allowRoles('Secretary', 'Director'), createEvent);
router.get('/full', verifyToken, allowRoles('Secretary', 'Director'), getFullEvents);
router.get('/public', verifyToken, getPublicEvents);
router.put('/:id', verifyToken, allowRoles('Secretary', 'Director'), editEvent);
router.delete('/:id', verifyToken, allowRoles('Secretary', 'Director'), deleteEvent);

module.exports = router;