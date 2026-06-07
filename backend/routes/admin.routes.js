const express = require('express');
const router = express.Router();
const { getPermissions, updatePermission, getDepartments, addDepartment, updateDepartmentStatus, deleteDepartment } = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

// PERMISSIONS
router.get('/permissions', verifyToken, allowRoles('Director', 'Secretary'), getPermissions);
router.put('/permissions/:id', verifyToken, allowRoles('Director'), updatePermission);

// DEPARTMENTS
router.get('/departments', verifyToken, getDepartments);
router.post('/departments', verifyToken, allowRoles('Director', 'Secretary'), addDepartment);
router.put('/departments/:id/status', verifyToken, allowRoles('Director', 'Secretary'), updateDepartmentStatus);
router.delete('/departments/:id', verifyToken, allowRoles('Director'), deleteDepartment);

module.exports = router;