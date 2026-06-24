const express = require('express');
const router = express.Router();
const { createEvent, getFullEvents, getPublicEvents, editEvent, deleteEvent } = require('../controllers/calendar.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles, checkPermission } = require('../middleware/role.middleware');

router.post('/', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Calendar', 'edit'), createEvent);
router.get('/full', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Calendar', 'view'), getFullEvents);
router.get('/public', verifyToken, getPublicEvents);
router.put('/:id', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Calendar', 'edit'), editEvent);
router.delete('/:id', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Calendar', 'delete'), deleteEvent);

module.exports = router;