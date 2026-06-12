import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ newPass: '', confirm: '' });
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff', department: '' });
  const [notifications, setNotifications] = useState({
    emailNotifs: true,
    meetingReminders: true,
    taskDeadlines: true,
    visitorAlerts: true,
    requestUpdates: false,
  });

  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const role = localStorage.getItem('role') || 'Staff';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newDept, setNewDept] = useState({ name: '', head: '' });
  const [showAddDept, setShowAddDept] = useState(false);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    if (activeTab === 'users' && (role === 'Secretary' || role === 'Director')) {
      fetchUsers();
    }
    if (activeTab === 'departments') {
      fetchDepartments();
    }
    if (activeTab === 'permissions' && role === 'Director') {
      fetchPermissions();
    }
  }, [activeTab]);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/admin/departments');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) {
      console.log('Error fetching departments:', err);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await API.get('/admin/permissions');
      if (res.data.success) setPermissions(res.data.data);
    } catch (err) {
      console.log('Error fetching permissions:', err);
    }
  };

  const handleAddDept = async () => {
    if (!newDept.name) { alert('Department name required'); return; }
    try {
      const res = await API.post('/admin/departments', newDept);
      if (res.data.success) {
        alert('Department added!');
        setShowAddDept(false);
        setNewDept({ name: '', head: '' });
        fetchDepartments();
      }
    } catch (err) {
      alert('Failed to add department');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      const res = await API.delete(`/admin/departments/${id}`);
      if (res.data.success) fetchDepartments();
    } catch (err) {
      alert('Failed to delete department');
    }
  };

  const handleTogglePermission = async (id, field, currentValue) => {
    try {
      const perm = permissions.find(p => p.id === id);
      const updated = { ...perm, [field]: currentValue ? 0 : 1 };
      const res = await API.put(`/admin/permissions/${id}`, updated);
      if (res.data.success) fetchPermissions();
    } catch (err) {
      alert('Failed to update permission');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/user/all');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.log('Error fetching users:', err);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { alert('Passwords do not match'); return; }
    if (passwords.newPass.length < 8) { alert('Password must be at least 8 characters'); return; }
    try {
      const res = await API.post('/auth/reset-password', { email, newPassword: passwords.newPass });
      if (res.data.success) {
        alert('Password updated successfully!');
        setPasswords({ newPass: '', confirm: '' });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to update password');
    }
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { alert('Name, email and password required'); return; }
    try {
      const res = await API.post('/user/add', newUser);
      if (res.data.success) {
        alert('User added successfully!');
        setShowAddUser(false);
        setNewUser({ name: '', email: '', password: '', role: 'Staff', department: '' });
        fetchUsers();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to add user');
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await API.put(`/user/${id}/status`, { status: newStatus });
      if (res.data.success) fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await API.delete(`/user/${id}`);
      if (res.data.success) fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const roleBg = { Director: '#FEE2E2', Secretary: '#DBEAFE', Staff: '#DCFCE7' };
  const roleColor = { Director: '#991B1B', Secretary: '#1E40AF', Staff: '#166534' };

  const tabs = role === 'Director'
    ? [{ key: 'profile', label: 'Profile' }, { key: 'password', label: 'Password' }, { key: 'permissions', label: 'Permissions' }, { key: 'notifications', label: 'Notifications' }, { key: 'security', label: 'Security' }]
    : role === 'Secretary'
      ? [{ key: 'profile', label: 'Profile' }, { key: 'password', label: 'Password' }, { key: 'users', label: 'Users' }, { key: 'departments', label: 'Departments' }, { key: 'notifications', label: 'Notifications' }, { key: 'security', label: 'Security' }]
      : [{ key: 'profile', label: 'Profile' }, { key: 'password', label: 'Password' }, { key: 'notifications', label: 'Notifications' }, { key: 'security', label: 'Security' }];

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.lnmiitLogo} />
          <div style={styles.logoTitle}>Director's Office Portal</div>
          <div style={styles.logoSub}>Director's Office</div>
        </div>
        {[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Requests', path: '/requests' },
          { label: 'Documents', path: '/documents' },
          { label: 'Visitors', path: '/visitors' },
          { label: 'Communication', path: '/communications' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'Reports', path: '/reports' },
          { label: 'Settings', path: '/settings' },
        ].map((item, i) => (
          <div key={i}
            style={{ ...styles.navItem, ...(i === 7 ? styles.navActive : {}) }}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.userName}>{name}</div>
            <div style={styles.userRole}>{role}</div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={lnmiitLogo} alt="LNMIIT" style={styles.topbarLogo} />
            <div>
              <div style={styles.topbarTitle}>Director's Office Portal — LNMIIT</div>
              <div style={styles.topbarSub}>{today}</div>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <button style={styles.logoutTopBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>⚙️ Settings</div>
              <div style={styles.pageSub}>Manage your account and preferences</div>
            </div>
            {saved && <div style={styles.savedBadge}>✓ Saved successfully!</div>}
          </div>

          {/* TABS */}
          <div style={styles.tabs}>
            {tabs.map(tab => (
              <div key={tab.key}
                style={{ ...styles.tab, ...(activeTab === tab.key ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}><span style={styles.cardTitle}>👤 Profile Information</span></div>
              <div style={styles.cardBody}>
                <div style={styles.avatarSection}>
                  <div style={styles.bigAvatar}>{initials}</div>
                  <div>
                    <div style={styles.avatarName}>{name}</div>
                    <div style={styles.avatarRole}>{role} — Director's Office</div>
                  </div>
                </div>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input style={{ ...styles.input, background: '#F8FAFC', color: '#94A3B8' }} value={name} disabled />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input style={{ ...styles.input, background: '#F8FAFC', color: '#94A3B8' }} value={email} disabled />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <input style={{ ...styles.input, background: '#F8FAFC', color: '#94A3B8' }} value={role} disabled />
                  </div>
                </div>
                <div style={styles.noteBox}>ℹ️ Profile details can only be changed by the Administrator.</div>
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}><span style={styles.cardTitle}>🔒 Change Password</span></div>
              <div style={styles.cardBody}>
                <div style={styles.formGroupFull}>
                  <label style={styles.label}>New Password</label>
                  <input style={styles.input} type="password" placeholder="Enter new password" value={passwords.newPass} onChange={e => setPasswords({ ...passwords, newPass: e.target.value })} />
                </div>
                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input style={styles.input} type="password" placeholder="Re-enter new password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} />
                </div>
                <div style={styles.rulesBox}>
                  {[
                    { text: 'At least 8 characters', ok: passwords.newPass.length >= 8 },
                    { text: 'Contains uppercase letter', ok: /[A-Z]/.test(passwords.newPass) },
                    { text: 'Contains a number', ok: /[0-9]/.test(passwords.newPass) },
                    { text: 'Passwords match', ok: passwords.newPass === passwords.confirm && passwords.confirm !== '' },
                  ].map((r, i) => (
                    <div key={i} style={{ fontSize: '11px', color: r.ok ? '#10B981' : '#94A3B8', marginBottom: '4px' }}>
                      {r.ok ? '✓' : '•'} {r.text}
                    </div>
                  ))}
                </div>
                <button style={styles.saveBtn} onClick={handleChangePassword}>Update Password</button>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT TAB */}
          {activeTab === 'users' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>👥 User Management</span>
                <button style={styles.addUserBtn} onClick={() => setShowAddUser(!showAddUser)}>+ Add User</button>
              </div>
              <div style={styles.cardBody}>
                {showAddUser && (
                  <div style={styles.addForm}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Full Name *</label>
                        <input style={styles.input} placeholder="Full name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Email *</label>
                        <input style={styles.input} placeholder="email@lnmiit.ac.in" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Password *</label>
                        <input style={styles.input} type="password" placeholder="Initial password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Role</label>
                        <select style={styles.input} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                          <option>Staff</option>
                          <option>Secretary</option>
                          <option>Director</option>
                        </select>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Department</label>
                        <input style={styles.input} placeholder="e.g. Computer Science" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={styles.saveBtn} onClick={handleAddUser}>Add User</button>
                      <button style={{ ...styles.saveBtn, background: '#64748B' }} onClick={() => setShowAddUser(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* USER LIST */}
                <div style={styles.userList}>
                  <div style={styles.userListHeader}>
                    <div style={{ ...styles.userCol, flex: 2 }}>Name</div>
                    <div style={{ ...styles.userCol, flex: 2 }}>Email</div>
                    <div style={{ ...styles.userCol, flex: 1 }}>Role</div>
                    <div style={{ ...styles.userCol, flex: 1 }}>Department</div>
                    <div style={{ ...styles.userCol, flex: 1 }}>Status</div>
                    <div style={{ ...styles.userCol, flex: 1 }}>Actions</div>
                  </div>
                  {users.length === 0 ? (
                    <div style={styles.emptyMsg}>No users found</div>
                  ) : users.map((u, i) => (
                    <div key={i} style={styles.userRow}>
                      <div style={{ ...styles.userCell, flex: 2, fontWeight: '600' }}>{u.name}</div>
                      <div style={{ ...styles.userCell, flex: 2, fontSize: '10px' }}>{u.email}</div>
                      <div style={{ ...styles.userCell, flex: 1 }}>
                        <span style={{ ...styles.roleBadge, background: roleBg[u.role] || '#EFF6FF', color: roleColor[u.role] || '#1A3A6B' }}>{u.role}</span>
                      </div>
                      <div style={{ ...styles.userCell, flex: 1, fontSize: '10px' }}>{u.department || '-'}</div>
                      <div style={{ ...styles.userCell, flex: 1 }}>
                        <span style={{ ...styles.roleBadge, background: u.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: u.status === 'active' ? '#166534' : '#991B1B' }}>{u.status}</span>
                      </div>
                      <div style={{ ...styles.userCell, flex: 1, gap: '4px' }}>
                        <button style={{ ...styles.actionBtn, background: u.status === 'active' ? '#FEF3C7' : '#DCFCE7', color: u.status === 'active' ? '#92400E' : '#166534' }}
                          onClick={() => handleDeactivate(u.id, u.status)}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        {role === 'Director' && (
                          <button style={{ ...styles.actionBtn, background: '#FEE2E2', color: '#991B1B' }} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>🏢 Department Management</span>
                <button style={styles.addUserBtn} onClick={() => setShowAddDept(!showAddDept)}>+ Add Department</button>
              </div>
              <div style={styles.cardBody}>
                {showAddDept && (
                  <div style={styles.addForm}>
                    <div style={styles.formGrid}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Department Name *</label>
                        <input style={styles.input} placeholder="e.g. Computer Science" value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Head of Department</label>
                        <input style={styles.input} placeholder="e.g. Dr. Sharma" value={newDept.head} onChange={e => setNewDept({ ...newDept, head: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={styles.saveBtn} onClick={handleAddDept}>Add</button>
                      <button style={{ ...styles.saveBtn, background: '#64748B' }} onClick={() => setShowAddDept(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                <div style={styles.userList}>
                  <div style={styles.userListHeader}>
                    <div style={{ ...styles.userCol, flex: 2 }}>Department</div>
                    <div style={{ ...styles.userCol, flex: 2 }}>Head</div>
                    <div style={{ ...styles.userCol, flex: 1 }}>Status</div>
                    <div style={{ ...styles.userCol, flex: 1 }}>Actions</div>
                  </div>
                  {departments.length === 0 ? (
                    <div style={styles.emptyMsg}>No departments found</div>
                  ) : departments.map((d, i) => (
                    <div key={i} style={styles.userRow}>
                      <div style={{ ...styles.userCell, flex: 2, fontWeight: '600' }}>{d.name}</div>
                      <div style={{ ...styles.userCell, flex: 2, fontSize: '10px' }}>{d.head || '-'}</div>
                      <div style={{ ...styles.userCell, flex: 1 }}>
                        <span style={{ ...styles.roleBadge, background: d.status === 'active' ? '#DCFCE7' : '#FEE2E2', color: d.status === 'active' ? '#166534' : '#991B1B' }}>{d.status}</span>
                      </div>
                      <div style={{ ...styles.userCell, flex: 1 }}>
                        {role === 'Director' && (
                          <button style={{ ...styles.actionBtn, background: '#FEE2E2', color: '#991B1B' }} onClick={() => handleDeleteDept(d.id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERMISSIONS TAB */}
          {activeTab === 'permissions' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>🔐 Role Permissions</span>
              </div>
              <div style={styles.cardBody}>
                {role !== 'Director' ? (
                  <div style={styles.noteBox}>Only Director can manage permissions.</div>
                ) : (
                  <div style={styles.userList}>
                    <div style={styles.userListHeader}>
                      <div style={{ ...styles.userCol, flex: 1 }}>Role</div>
                      <div style={{ ...styles.userCol, flex: 1.5 }}>Module</div>
                      <div style={{ ...styles.userCol, flex: 0.8 }}>View</div>
                      <div style={{ ...styles.userCol, flex: 0.8 }}>Edit</div>
                      <div style={{ ...styles.userCol, flex: 0.8 }}>Delete</div>
                      <div style={{ ...styles.userCol, flex: 0.8 }}>Approve</div>
                    </div>
                    {permissions.length === 0 ? (
                      <div style={styles.emptyMsg}>No permissions found</div>
                    ) : permissions.map((p, i) => (
                      <div key={i} style={styles.userRow}>
                        <div style={{ ...styles.userCell, flex: 1 }}>
                          <span style={{ ...styles.roleBadge, background: roleBg[p.role] || '#EFF6FF', color: roleColor[p.role] || '#1A3A6B' }}>{p.role}</span>
                        </div>
                        <div style={{ ...styles.userCell, flex: 1.5, fontSize: '11px' }}>{p.module_name}</div>
                        {['can_view', 'can_edit', 'can_delete', 'can_approve'].map(field => (
                          <div key={field} style={{ ...styles.userCell, flex: 0.8 }}>
                            <div
                              style={{ ...styles.toggle, width: '36px', height: '20px', background: p[field] ? '#1A3A6B' : '#E2E8F0', cursor: 'pointer' }}
                              onClick={() => handleTogglePermission(p.id, field, p[field])}
                            >
                              <div style={{ ...styles.toggleDot, width: '16px', height: '16px', transform: p[field] ? 'translateX(18px)' : 'translateX(2px)' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}><span style={styles.cardTitle}>🔔 Notification Preferences</span></div>
              <div style={styles.cardBody}>
                {[
                  { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive all notifications via email' },
                  { key: 'meetingReminders', label: 'Meeting Reminders', desc: 'Get reminded 30 mins before meetings' },
                  { key: 'taskDeadlines', label: 'Task Deadline Alerts', desc: 'Alert when task deadline is approaching' },
                  { key: 'visitorAlerts', label: 'Visitor Alerts', desc: 'Notify when a visitor appointment is confirmed' },
                  { key: 'requestUpdates', label: 'Request Status Updates', desc: 'Notify when your request is approved/rejected' },
                ].map((n, i) => (
                  <div key={i} style={styles.notifRow}>
                    <div>
                      <div style={styles.notifLabel}>{n.label}</div>
                      <div style={styles.notifDesc}>{n.desc}</div>
                    </div>
                    <div
                      style={{ ...styles.toggle, background: notifications[n.key] ? '#1A3A6B' : '#E2E8F0' }}
                      onClick={() => setNotifications({ ...notifications, [n.key]: !notifications[n.key] })}
                    >
                      <div style={{ ...styles.toggleDot, transform: notifications[n.key] ? 'translateX(20px)' : 'translateX(2px)' }}></div>
                    </div>
                  </div>
                ))}
                <button style={styles.saveBtn} onClick={handleSave}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}><span style={styles.cardTitle}>🛡️ Security</span></div>
              <div style={styles.cardBody}>
                <div style={styles.dangerZone}>
                  <div style={styles.dangerTitle}>⚠️ Session Management</div>
                  <div style={styles.dangerRow}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>Logout from this device</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>This will end your current session</div>
                    </div>
                    <button style={styles.dangerBtn} onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#F0F4FA', overflow: 'hidden' },
  sidebar: { width: '168px', background: '#122951', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' },
  logoRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
  badge: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px' },
  logoTitle: { color: '#fff', fontSize: '13px', fontWeight: '700' },
  logoSub: { color: 'rgba(255,255,255,0.4)', fontSize: '9px' },
  navItem: { display: 'flex', alignItems: 'center', padding: '9px 16px', margin: '1px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  navActive: { background: 'rgba(37,99,235,0.35)', color: '#fff' },
  sidebarFooter: { marginTop: 'auto', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userName: { color: '#fff', fontSize: '11px', fontWeight: '600' },
  userRole: { color: 'rgba(255,255,255,0.45)', fontSize: '9px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#1A3A6B', padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarTitle: { color: '#fff', fontSize: '14px', fontWeight: '700' },
  topbarSub: { color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '1px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  notifBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '14px', cursor: 'pointer' },
  rolePill: { background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  content: { flex: 1, overflowY: 'auto', padding: '18px 22px' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  pageTitle: { fontSize: '16px', fontWeight: '700', color: '#1E293B' },
  pageSub: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
  savedBadge: { background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '600' },
  tabs: { display: 'flex', gap: '4px', marginBottom: '14px', background: '#fff', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', width: 'fit-content', flexWrap: 'wrap' },
  tab: { padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#64748B', cursor: 'pointer' },
  tabActive: { background: '#1A3A6B', color: '#fff' },
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' },
  cardHeader: { padding: '13px 16px 10px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: '12px', fontWeight: '700', color: '#1E293B' },
  cardBody: { padding: '20px' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' },
  bigAvatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,#1A3A6B,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  avatarName: { fontSize: '15px', fontWeight: '700', color: '#1E293B', marginBottom: '3px' },
  avatarRole: { fontSize: '11px', color: '#64748B', marginBottom: '8px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  formGroupFull: { display: 'flex', flexDirection: 'column', marginBottom: '14px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
  input: { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 13px', fontSize: '12px', color: '#1E293B', outline: 'none', boxSizing: 'border-box' },
  noteBox: { background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px 13px', fontSize: '10px', color: '#1E40AF', lineHeight: 1.5 },
  rulesBox: { background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px' },
  saveBtn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  addUserBtn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  addForm: { background: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '16px' },
  userList: { border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' },
  userListHeader: { display: 'flex', background: '#F8FAFC', padding: '10px 14px', borderBottom: '1px solid #E2E8F0' },
  userCol: { fontSize: '10px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  userRow: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #F8FAFC' },
  userCell: { display: 'flex', alignItems: 'center', fontSize: '11px', color: '#1E293B', paddingRight: '8px' },
  roleBadge: { fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
  actionBtn: { fontSize: '9px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', marginRight: '4px' },
  notifRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F8FAFC' },
  notifLabel: { fontSize: '12px', fontWeight: '600', color: '#1E293B', marginBottom: '2px' },
  notifDesc: { fontSize: '10px', color: '#94A3B8' },
  toggle: { width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleDot: { width: '20px', height: '20px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '2px', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  dangerZone: { background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '10px', padding: '14px' },
  dangerTitle: { fontSize: '11px', fontWeight: '700', color: '#991B1B', marginBottom: '10px' },
  dangerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  dangerBtn: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px 16px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' },
  emptyMsg: { padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' },
  logoutTopBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#FCA5A5', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  lnmiitLogo: { width: '90px', objectFit: 'contain', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '4px' },
  topbarLogo: { height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '3px' },
  topbarSub: { color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '1px' },
};

export default Settings;    