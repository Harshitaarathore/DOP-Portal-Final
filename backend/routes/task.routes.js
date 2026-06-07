const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, updateTaskStatus, deleteTask } = require('../controllers/task.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.post('/', verifyToken, allowRoles('Secretary', 'Director'), createTask);
router.get('/', verifyToken, getAllTasks);
router.put('/:id/status', verifyToken, updateTaskStatus);
router.delete('/:id', verifyToken, allowRoles('Secretary', 'Director'), deleteTask);

module.exports = router;