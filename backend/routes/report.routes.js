const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/report.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.get('/', verifyToken, allowRoles('Secretary', 'Director'), getReports);

module.exports = router;