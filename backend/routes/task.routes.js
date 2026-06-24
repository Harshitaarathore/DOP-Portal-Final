const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, updateTaskStatus, deleteTask } = require('../controllers/task.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles, checkPermission } = require('../middleware/role.middleware');

router.post('/', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Tasks', 'edit'), createTask);
router.get('/', verifyToken, checkPermission('Tasks', 'view'), getAllTasks);
router.put('/:id/status', verifyToken, checkPermission('Tasks', 'edit'), updateTaskStatus);
router.delete('/:id', verifyToken, allowRoles('Secretary', 'Director'), checkPermission('Tasks', 'delete'), deleteTask);

module.exports = router;