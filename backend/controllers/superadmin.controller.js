const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ── DASHBOARD STATS ─────────────────────────────────────
const getDashboardStats = (req, res) => {
  const queries = {
    totalUsers:    `SELECT COUNT(*) as count FROM users WHERE role != 'SuperAdmin'`,
    activeUsers:   `SELECT COUNT(*) as count FROM users WHERE status = 'active' AND role != 'SuperAdmin'`,
    pendingTickets:`SELECT COUNT(*) as count FROM support_tickets WHERE status IN ('Open','In Progress')`,
    openTickets:   `SELECT COUNT(*) as count FROM support_tickets WHERE status = 'Open'`,
    totalDepts:    `SELECT COUNT(*) as count FROM departments`,
    auditToday:    `SELECT COUNT(*) as count FROM audit_logs WHERE DATE(timestamp) = CURDATE()`,
    pendingRequests:`SELECT COUNT(*) as count FROM meeting_requests WHERE status = 'Pending'`,
    pendingVisitors:`SELECT COUNT(*) as count FROM visitors WHERE approval_status = 'Pending'`,
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach(key => {
    db.query(queries[key], (err, rows) => {
      results[key] = err ? 0 : rows[0].count;
      completed++;
      if (completed === keys.length) {
        // Recent audit logs
        db.query(`SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id ORDER BY al.timestamp DESC LIMIT 8`, (err2, logs) => {
          results.recentLogs = err2 ? [] : logs;
          res.json({ success: true, data: results });
        });
      }
    });
  });
};

// ── USER MANAGEMENT ──────────────────────────────────────
const getAllUsers = (req, res) => {
  db.query(`SELECT id, name, email, role, department, status, created_at FROM users ORDER BY created_at DESC`, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, data: results });
  });
};

const createUser = async (req, res) => {
  const { name, email, password, role, department } = req.body;
  if (!name || !email || !password || !role) return res.json({ success: false, message: 'Name, email, password and role are required', data: null });

  const existing = await new Promise(r => db.query(`SELECT id FROM users WHERE email = ?`, [email], (e, rows) => r(rows)));
  if (existing.length > 0) return res.json({ success: false, message: 'Email already exists', data: null });

  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();
  db.query(`INSERT INTO users (id, name, email, password, role, department, status) VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [id, name, email, hashed, role, department || ''],
    (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), req.user.id, `Created user: ${name} (${role})`, 'UserManagement']);
      res.json({ success: true, message: 'User created successfully', data: { id } });
    }
  );
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, role, department, status } = req.body;
  db.query(`UPDATE users SET name=?, role=?, department=?, status=? WHERE id=?`,
    [name, role, department, status, id],
    (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), req.user.id, `Updated user ${id}: role=${role}, status=${status}`, 'UserManagement']);
      res.json({ success: true, message: 'User updated', data: null });
    }
  );
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT name, email FROM users WHERE id=?`, [id], (err, rows) => {
    if (err || !rows.length) return res.json({ success: false, message: 'User not found', data: null });
    const user = rows[0];
    db.query(`DELETE FROM users WHERE id=?`, [id], (err2) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), req.user.id, `Deleted user: ${user.name} (${user.email})`, 'UserManagement']);
      res.json({ success: true, message: 'User deleted', data: null });
    });
  });
};

const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.json({ success: false, message: 'Password must be at least 6 characters', data: null });
  const hashed = await bcrypt.hash(newPassword, 10);
  db.query(`UPDATE users SET password=? WHERE id=?`, [hashed, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), req.user.id, `Reset password for user ${id}`, 'UserManagement']);
    res.json({ success: true, message: 'Password reset successfully', data: null });
  });
};

const toggleUserStatus = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT status, name FROM users WHERE id=?`, [id], (err, rows) => {
    if (err || !rows.length) return res.json({ success: false, message: 'User not found', data: null });
    const newStatus = rows[0].status === 'active' ? 'inactive' : 'active';
    db.query(`UPDATE users SET status=? WHERE id=?`, [newStatus, id], (err2) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), req.user.id, `${newStatus === 'active' ? 'Activated' : 'Deactivated'} user: ${rows[0].name}`, 'UserManagement']);
      res.json({ success: true, message: `User ${newStatus}`, data: { status: newStatus } });
    });
  });
};

// ── DEPARTMENT MANAGEMENT ────────────────────────────────
const getDepartments = (req, res) => {
  db.query(`SELECT * FROM departments ORDER BY name ASC`, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, data: results });
  });
};

const createDepartment = (req, res) => {
  const { name, head } = req.body;
  if (!name) return res.json({ success: false, message: 'Department name required', data: null });
  const id = uuidv4();
  db.query(`INSERT INTO departments (id, name, head, status) VALUES (?, ?, ?, 'active')`, [id, name, head || ''], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), req.user.id, `Created department: ${name}`, 'Departments']);
    res.json({ success: true, message: 'Department created', data: null });
  });
};

const updateDepartment = (req, res) => {
  const { id } = req.params;
  const { name, head, status } = req.body;
  db.query(`UPDATE departments SET name=?, head=?, status=? WHERE id=?`, [name, head, status, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Department updated', data: null });
  });
};

const deleteDepartment = (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM departments WHERE id=?`, [id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Department deleted', data: null });
  });
};

// ── PERMISSIONS ──────────────────────────────────────────
const getPermissions = (req, res) => {
  db.query(`SELECT * FROM roles_permissions ORDER BY role ASC, module_name ASC`, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, data: results });
  });
};

const updatePermission = (req, res) => {
  const { id } = req.params;
  const { can_view, can_edit, can_delete, can_approve } = req.body;
  db.query(`UPDATE roles_permissions SET can_view=?, can_edit=?, can_delete=?, can_approve=? WHERE id=?`,
    [can_view, can_edit, can_delete, can_approve, id], (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
        [uuidv4(), req.user.id, `Updated permission id=${id}`, 'Permissions']);
      res.json({ success: true, message: 'Permission updated', data: null });
    }
  );
};

// ── SUPPORT TICKETS ──────────────────────────────────────
const getAllTickets = (req, res) => {
  const sql = `
    SELECT st.*, u.name as raised_by_name, u.email as raised_by_email,
           a.name as assigned_to_name
    FROM support_tickets st
    LEFT JOIN users u ON u.id = st.raised_by
    LEFT JOIN users a ON a.id = st.assigned_to
    ORDER BY st.created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, data: results });
  });
};

const getMyTickets = (req, res) => {
  db.query(`SELECT * FROM support_tickets WHERE raised_by=? ORDER BY created_at DESC`, [req.user.id], (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, data: results });
  });
};

const createTicket = (req, res) => {
  const { subject, category, description, priority } = req.body;
  if (!subject || !description) return res.json({ success: false, message: 'Subject and description required', data: null });
  const id = uuidv4();
  db.query(`INSERT INTO support_tickets (id, raised_by, subject, category, description, priority) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, req.user.id, subject, category || 'General', description, priority || 'Medium'],
    (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      // Notify SuperAdmin
      db.query(`SELECT id FROM users WHERE role='SuperAdmin'`, (e, admins) => {
        if (!e && admins) {
          admins.forEach(a => {
            db.query(`INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, 0)`,
              [uuidv4(), a.id, `🎫 New support ticket: "${subject}" (${priority || 'Medium'} priority)`, 'ticket']);
          });
        }
      });
      res.json({ success: true, message: 'Ticket raised successfully', data: { id } });
    }
  );
};

const updateTicketStatus = (req, res) => {
  const { id } = req.params;
  const { status, assigned_to } = req.body;
  db.query(`UPDATE support_tickets SET status=?, assigned_to=? WHERE id=?`, [status, assigned_to || null, id], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    // Notify ticket raiser
    db.query(`SELECT raised_by, subject FROM support_tickets WHERE id=?`, [id], (e, rows) => {
      if (!e && rows.length) {
        db.query(`INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, 0)`,
          [uuidv4(), rows[0].raised_by, `Your ticket "${rows[0].subject}" status updated to: ${status}`, 'ticket']);
      }
    });
    db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), req.user.id, `Updated ticket ${id} status to ${status}`, 'SupportTickets']);
    res.json({ success: true, message: 'Ticket updated', data: null });
  });
};

const addTicketComment = (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  if (!comment) return res.json({ success: false, message: 'Comment required', data: null });
  db.query(`INSERT INTO ticket_comments (id, ticket_id, commented_by, comment) VALUES (?, ?, ?, ?)`,
    [uuidv4(), id, req.user.id, comment],
    (err) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      res.json({ success: true, message: 'Comment added', data: null });
    }
  );
};

const getTicketComments = (req, res) => {
  const { id } = req.params;
  db.query(`SELECT tc.*, u.name as commenter_name, u.role as commenter_role FROM ticket_comments tc LEFT JOIN users u ON u.id = tc.commented_by WHERE tc.ticket_id=? ORDER BY tc.created_at ASC`, [id],
    (err, results) => {
      if (err) return res.json({ success: false, message: err.message, data: null });
      res.json({ success: true, data: results });
    }
  );
};

// ── AUDIT LOGS ───────────────────────────────────────────
const getAuditLogs = (req, res) => {
  const { module, limit = 100 } = req.query;
  let sql = `SELECT al.*, u.name as user_name, u.role as user_role FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id`;
  const params = [];
  if (module) { sql += ` WHERE al.module = ?`; params.push(module); }
  sql += ` ORDER BY al.timestamp DESC LIMIT ?`;
  params.push(parseInt(limit));
  db.query(sql, params, (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, data: results });
  });
};

// ── SYSTEM HEALTH ────────────────────────────────────────
const getSystemHealth = (req, res) => {
  const startTime = process.uptime();
  const memUsage = process.memoryUsage();

  db.query(`SELECT COUNT(*) as count FROM users WHERE status='active'`, (err, activeUsers) => {
    db.query(`SELECT COUNT(*) as count FROM system_logs WHERE event_type='failed_login' AND DATE(created_at)=CURDATE()`, (err2, failedLogins) => {
      db.query(`SELECT COUNT(*) as count FROM audit_logs WHERE DATE(timestamp)=CURDATE()`, (err3, todayActions) => {
        res.json({
          success: true,
          data: {
            server: {
              uptime: Math.floor(startTime / 3600) + 'h ' + Math.floor((startTime % 3600) / 60) + 'm',
              memory_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
              memory_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
              node_version: process.version,
              status: 'Online',
            },
            database: { status: err ? 'Error' : 'Connected' },
            stats: {
              active_users: activeUsers?.[0]?.count || 0,
              failed_logins_today: failedLogins?.[0]?.count || 0,
              actions_today: todayActions?.[0]?.count || 0,
            }
          }
        });
      });
    });
  });
};

// ── BROADCAST NOTIFICATION ───────────────────────────────
const broadcastNotification = (req, res) => {
  const { message, target_role } = req.body;
  if (!message) return res.json({ success: false, message: 'Message required', data: null });

  let sql = `SELECT id FROM users WHERE status='active' AND role != 'SuperAdmin'`;
  const params = [];
  if (target_role && target_role !== 'all') { sql += ` AND role = ?`; params.push(target_role); }

  db.query(sql, params, (err, users) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    users.forEach(u => {
      db.query(`INSERT INTO notifications (id, user_id, message, type, read_status) VALUES (?, ?, ?, ?, 0)`,
        [uuidv4(), u.id, `📢 ${message}`, 'broadcast']);
    });
    db.query(`INSERT INTO audit_logs (id, user_id, action, module, timestamp) VALUES (?, ?, ?, ?, NOW())`,
      [uuidv4(), req.user.id, `Broadcast to ${target_role || 'all'}: "${message}"`, 'Notifications']);
    res.json({ success: true, message: `Notification sent to ${users.length} users`, data: null });
  });
};

// ── REPORTS ──────────────────────────────────────────────
const getSuperAdminReports = (req, res) => {
  const queries = {
    usersByRole: `SELECT role, COUNT(*) as count FROM users WHERE role != 'SuperAdmin' GROUP BY role`,
    ticketsByStatus: `SELECT status, COUNT(*) as count FROM support_tickets GROUP BY status`,
    ticketsByCategory: `SELECT category, COUNT(*) as count FROM support_tickets GROUP BY category`,
    requestsByDept: `SELECT department, COUNT(*) as count FROM meeting_requests GROUP BY department ORDER BY count DESC LIMIT 10`,
    recentActivity: `SELECT al.action, al.module, al.timestamp, u.name, u.role FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id ORDER BY al.timestamp DESC LIMIT 20`,
  };

  const results = {};
  const keys = Object.keys(queries);
  let done = 0;
  keys.forEach(key => {
    db.query(queries[key], (err, rows) => {
      results[key] = err ? [] : rows;
      done++;
      if (done === keys.length) res.json({ success: true, data: results });
    });
  });
};

module.exports = {
  getDashboardStats, getAllUsers, createUser, updateUser, deleteUser, resetUserPassword, toggleUserStatus,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getPermissions, updatePermission,
  getAllTickets, getMyTickets, createTicket, updateTicketStatus, addTicketComment, getTicketComments,
  getAuditLogs, getSystemHealth, broadcastNotification, getSuperAdminReports,
};