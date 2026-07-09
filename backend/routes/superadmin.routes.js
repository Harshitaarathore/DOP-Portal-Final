const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const SA = require('../controllers/superadmin.controller');

const isSA = [verifyToken, allowRoles('SuperAdmin')];
const isAuth = [verifyToken]; // tickets can be raised by anyone logged in

// Dashboard
router.get('/dashboard', ...isSA, SA.getDashboardStats);

// Users
router.get('/users',                  ...isSA, SA.getAllUsers);
router.post('/users',                 ...isSA, SA.createUser);
router.put('/users/:id',              ...isSA, SA.updateUser);
router.delete('/users/:id',           ...isSA, SA.deleteUser);
router.put('/users/:id/reset-password',...isSA, SA.resetUserPassword);
router.put('/users/:id/toggle-status',...isSA, SA.toggleUserStatus);

// Departments
router.get('/departments',            ...isSA, SA.getDepartments);
router.post('/departments',           ...isSA, SA.createDepartment);
router.put('/departments/:id',        ...isSA, SA.updateDepartment);
router.delete('/departments/:id',     ...isSA, SA.deleteDepartment);

// Permissions
router.get('/permissions',            ...isSA, SA.getPermissions);
router.put('/permissions/:id',        ...isSA, SA.updatePermission);

// Support Tickets
router.get('/tickets',                ...isSA, SA.getAllTickets);
router.put('/tickets/:id/status',     ...isSA, SA.updateTicketStatus);
router.get('/tickets/:id/comments',   verifyToken, SA.getTicketComments);
router.post('/tickets/:id/comments',  verifyToken, SA.addTicketComment);
// Any logged-in user can raise/view own tickets
router.get('/my-tickets',             verifyToken, SA.getMyTickets);
router.post('/tickets',               verifyToken, SA.createTicket);

// Audit Logs
router.get('/audit-logs',             ...isSA, SA.getAuditLogs);

// System Health
router.get('/system-health',          ...isSA, SA.getSystemHealth);

// Notifications
router.post('/broadcast',             ...isSA, SA.broadcastNotification);

// Reports
router.get('/reports',                ...isSA, SA.getSuperAdminReports);

module.exports = router;