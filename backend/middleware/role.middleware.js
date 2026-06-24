const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.json({ success: false, message: 'Access denied', data: null });
    }
    next();
  };
};

// checkPermission(moduleName, action) — consults the roles_permissions table for
// (req.user.role, moduleName) and checks the can_<action> column.
// Runs AFTER allowRoles() on a route, as a second, finer-grained gate that Director
// can adjust from Settings > Permissions without touching code.
//
// Fails safe: if no row exists for that role+module (e.g. table not yet seeded,
// or a module name typo), the request is denied rather than silently allowed —
// this matters because an empty/misconfigured table must never act as "allow everything".
const checkPermission = (moduleName, action) => {
  const db = require('../config/db');
  const column = `can_${action}`;

  return (req, res, next) => {
    const sql = `SELECT ${column} AS allowed FROM roles_permissions WHERE role = ? AND module_name = ? LIMIT 1`;
    db.query(sql, [req.user.role, moduleName], (err, rows) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      if (!rows.length || !rows[0].allowed) {
        return res.json({ success: false, message: `Permission denied: ${req.user.role} cannot ${action} ${moduleName}`, data: null });
      }
      next();
    });
  };
};

module.exports = { allowRoles, checkPermission };