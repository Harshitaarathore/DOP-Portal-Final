import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import { useNotifCount } from '../hooks/useNotifCount';

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1A3A6B';
  return (
    <div style={{ position:'fixed', top:'20px', right:'20px', background:bg, color:'#fff', padding:'12px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:'600', zIndex:9999, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:'8px' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {message}
    </div>
  );
}

function Settings() {
  const navigate = useNavigate();
  const [activeTab,   setActiveTab]   = useState('profile');
  const [hoveredNav,  setHoveredNav]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  // Auth info
  const name     = localStorage.getItem('name')  || 'User';
  const email    = localStorage.getItem('email') || '';
  const role     = localStorage.getItem('role')  || 'Staff';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today    = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const { count: notifCount } = useNotifCount();

  // Password
  const [passwords, setPasswords] = useState({ newPass:'', confirm:'' });

  // Users
  const [users,       setUsers]       = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser,     setNewUser]     = useState({ name:'', email:'', password:'', role:'Staff', department:'' });

  // Departments
  const [departments,  setDepartments]  = useState([]);
  const [showAddDept,  setShowAddDept]  = useState(false);
  const [newDept,      setNewDept]      = useState({ name:'', head:'' });

  // Permissions
  const [permissions, setPermissions] = useState([]);

  // Notifications
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifs: true, meetingReminders: true, taskDeadlines: true,
    visitorAlerts: true, requestUpdates: false,
  });

  const canAdmin = role === 'Secretary' || role === 'Director';

  const navItems = role === 'Director' ? [
  { label:'Dashboard', path:'/director-dashboard', icon:'🏠' },
  { label:'Requests',  path:'/requests',           icon:'📋' },
  { label:'Calendar',  path:'/calendar',            icon:'📅' },
  { label:'Settings',  path:'/settings',            icon:'⚙️' },
] : [
  { label:'Dashboard', path:'/dashboard',           icon:'🏠' },
  { label:'Calendar',      path:'/calendar',       icon:'📅' },
  { label:'Requests',      path:'/requests',       icon:'📋' },
  { label:'Documents',     path:'/documents',      icon:'📁' },
  { label:'Visitors',      path:'/visitors',       icon:'👥' },
  { label:'Communication', path:'/communications', icon:'💬' },
  { label:'Tasks',         path:'/tasks',          icon:'✅' },
  { label:'Announcements', path:'/announcements',  icon:'📢' },
  { label:'Reports',       path:'/reports',        icon:'📊' },
  { label:'Audit Logs', path:'/audit-logs', icon:'🕵️' },
  { label:'Settings',      path:'/settings',       icon:'⚙️' },
];

  const tabs = canAdmin
    ? [
        { key:'profile',      label:'Profile' },
        { key:'password',     label:'Password' },
        { key:'users',        label:'Users' },
        { key:'departments',  label:'Departments' },
        { key:'permissions',  label:'Permissions' },
        { key:'notifications',label:'Notifications' },
        { key:'security',     label:'Security' },
      ]
    : [
        { key:'profile',      label:'Profile' },
        { key:'password',     label:'Password' },
        { key:'notifications',label:'Notifications' },
        { key:'security',     label:'Security' },
      ];

useEffect(() => {
  if (activeTab === 'users'        && canAdmin)  fetchUsers();
  if (activeTab === 'departments')               fetchDepartments();
  if (activeTab === 'permissions')               fetchPermissions(); // removed Director-only check
  if (activeTab === 'notifications')             fetchNotifPrefs();
}, [activeTab]);

const fetchNotifPrefs = async () => {
  try {
    const res = await API.get('/user/notif-prefs');
    if (res.data.success) setNotifPrefs({
      emailNotifs:      !!res.data.data.emailNotifs,
      meetingReminders: !!res.data.data.meetingReminders,
      taskDeadlines:    !!res.data.data.taskDeadlines,
      visitorAlerts:    !!res.data.data.visitorAlerts,
      requestUpdates:   !!res.data.data.requestUpdates,
    });
  } catch (err) { console.log(err); }
};

const handleSaveNotifPrefs = async () => {
  try {
    const res = await API.put('/user/notif-prefs', notifPrefs);
    if (res.data.success) showToast('Notification preferences saved!');
    else showToast(res.data.message, 'error');
  } catch { showToast('Failed to save preferences', 'error'); }
};

  // ── API calls ──────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await API.get('/user/all');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) { console.log(err); }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/admin/departments');
      if (res.data.success) setDepartments(res.data.data);
    } catch (err) { console.log(err); }
  };

  const fetchPermissions = async () => {
    try {
      const res = await API.get('/admin/permissions');
      if (res.data.success) setPermissions(res.data.data);
    } catch (err) { console.log(err); }
  };

  // Password
  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (passwords.newPass.length < 8)            { showToast('Minimum 8 characters', 'error'); return; }
    try {
      const res = await API.post('/auth/reset-password', { email, newPassword: passwords.newPass });
      if (res.data.success) {
        showToast('Password updated!');
        setPasswords({ newPass:'', confirm:'' });
      } else { showToast(res.data.message, 'error'); }
    } catch { showToast('Failed to update password', 'error'); }
  };

  // Users
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { showToast('Name, email and password required', 'error'); return; }
    try {
      const res = await API.post('/user/add', newUser);
      if (res.data.success) {
        showToast('User added!');
        setShowAddUser(false);
        setNewUser({ name:'', email:'', password:'', role:'Staff', department:'' });
        fetchUsers();
      } else { showToast(res.data.message, 'error'); }
    } catch { showToast('Failed to add user', 'error'); }
  };

  const handleDeactivate = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await API.put(`/user/${id}/status`, { status: newStatus });
      if (res.data.success) { fetchUsers(); showToast(`User ${newStatus}`); }
    } catch { showToast('Failed to update status', 'error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      const res = await API.delete(`/user/${id}`);
      if (res.data.success) { fetchUsers(); showToast('User deleted'); }
    } catch { showToast('Failed to delete user', 'error'); }
  };

  // Departments
  const handleAddDept = async () => {
    if (!newDept.name) { showToast('Department name required', 'error'); return; }
    try {
      const res = await API.post('/admin/departments', newDept);
      if (res.data.success) {
        showToast('Department added!');
        setShowAddDept(false);
        setNewDept({ name:'', head:'' });
        fetchDepartments();
      } else { showToast(res.data.message, 'error'); }
    } catch { showToast('Failed to add department', 'error'); }
  };

  const handleToggleDeptStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await API.put(`/admin/departments/${id}/status`, { status: newStatus });
      if (res.data.success) { fetchDepartments(); showToast(`Department ${newStatus}`); }
    } catch { showToast('Failed to update department', 'error'); }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      const res = await API.delete(`/admin/departments/${id}`);
      if (res.data.success) { fetchDepartments(); showToast('Department deleted'); }
    } catch { showToast('Failed to delete department', 'error'); }
  };

  // Permissions
  const handleTogglePermission = async (id, field, currentValue) => {
    try {
      const perm = permissions.find(p => p.id === id);
      const updated = { ...perm, [field]: currentValue ? 0 : 1 };
      const res = await API.put(`/admin/permissions/${id}`, updated);
      if (res.data.success) fetchPermissions();
    } catch { showToast('Failed to update permission', 'error'); }
  };

  const roleBg    = { Director:'#FEE2E2', Secretary:'#DBEAFE', Staff:'#DCFCE7' };
  const roleColor = { Director:'#991B1B', Secretary:'#1E40AF', Staff:'#166534'  };

  return (
    <div style={S.page} className="page-transition">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logoWrap}><img src={lnmiitLogo} alt="LNMIIT" style={S.logo} /></div>
        <div style={S.portalBanner}>
          <div style={S.portalName}>Director's Office Portal</div>
          <div style={S.portalDate}>{today}</div>
        </div>
        <div style={S.divider} />
        {navItems.map((item, i) => (
          <div key={i}
            style={{ ...S.navItem, ...(item.path === window.location.pathname ? S.navActive : {}), ...(hoveredNav === i && item.path !== window.location.pathname ? { background:'#F8FAFC', color:'#1A3A6B' } : {}) }}
            onMouseEnter={() => setHoveredNav(i)}
            onMouseLeave={() => setHoveredNav(null)}
            onClick={() => navigate(item.path)}
          >
            <span style={S.navIcon}>{item.icon}</span>{item.label}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={S.main}>

        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={S.topbarUser}>
            <div style={S.topbarAvatar}>{initials}</div>
            <div>
              <div style={S.topbarUserName}>{name}</div>
              <div style={S.topbarUserEmail}>{email}</div>
              <div style={S.topbarUserRole}>{role}</div>
            </div>
          </div>
          <div style={S.topbarRight}>
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>
              🔔 {notifCount > 0 && <span style={S.notifBadge}>{notifCount}</span>}
            </div>
            {/* <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button> */}
            <button style={S.btnLogout} onClick={() => { localStorage.clear(); navigate('/'); }}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>⚙️ Settings</div>
              <div style={S.pageSub}>Manage your account and preferences</div>
            </div>
          </div>

          {/* TABS */}
          <div style={S.tabs}>
            {tabs.map(tab => (
              <div key={tab.key}
                style={{ ...S.tab, ...(activeTab === tab.key ? S.tabActive : {}) }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div style={S.card}>
              <div style={S.cardHeader}><span style={S.cardTitle}>👤 Profile Information</span></div>
              <div style={S.cardBody}>
                <div style={S.avatarSection}>
                  <div style={S.bigAvatar}>{initials}</div>
                  <div>
                    <div style={S.avatarName}>{name}</div>
                    <div style={S.avatarRole}>{role} — Director's Office</div>
                  </div>
                </div>
                <div style={S.formGrid}>
                  <FormField label="Full Name" value={name} disabled />
                  <FormField label="Email"     value={email} disabled />
                  <FormField label="Role"      value={role}  disabled />
                </div>
                <div style={S.noteBox}>ℹ️ Profile details can only be changed by the Administrator.</div>
              </div>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {activeTab === 'password' && (
            <div style={S.card}>
              <div style={S.cardHeader}><span style={S.cardTitle}>🔒 Change Password</span></div>
              <div style={S.cardBody}>
                <FormField label="New Password"     type="password" value={passwords.newPass}  onChange={e => setPasswords({...passwords, newPass:e.target.value})}  placeholder="Enter new password" />
                <FormField label="Confirm Password" type="password" value={passwords.confirm}  onChange={e => setPasswords({...passwords, confirm:e.target.value})}   placeholder="Re-enter password" />
                <div style={S.rulesBox}>
                  {[
                    { text:'At least 8 characters',    ok: passwords.newPass.length >= 8 },
                    { text:'Contains uppercase letter', ok: /[A-Z]/.test(passwords.newPass) },
                    { text:'Contains a number',         ok: /[0-9]/.test(passwords.newPass) },
                    { text:'Passwords match',           ok: passwords.newPass === passwords.confirm && passwords.confirm !== '' },
                  ].map((r,i) => (
                    <div key={i} style={{ fontSize:'11px', color:r.ok ? '#10B981' : '#94A3B8', marginBottom:'4px' }}>{r.ok ? '✓' : '•'} {r.text}</div>
                  ))}
                </div>
                <button style={S.saveBtn} onClick={handleChangePassword}>Update Password</button>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && canAdmin && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}>👥 User Management</span>
                <button style={S.addBtn} onClick={() => setShowAddUser(!showAddUser)}>+ Add User</button>
              </div>
              <div style={S.cardBody}>
                {showAddUser && (
                  <div style={S.addForm}>
                    <div style={S.formGrid}>
                      <FormField label="Full Name *"    value={newUser.name}       onChange={e => setNewUser({...newUser, name:e.target.value})}       placeholder="Full name" />
                      <FormField label="Email *"        value={newUser.email}      onChange={e => setNewUser({...newUser, email:e.target.value})}      placeholder="email@lnmiit.ac.in" />
                      <FormField label="Password *"     value={newUser.password}   onChange={e => setNewUser({...newUser, password:e.target.value})}   placeholder="Initial password" type="password" />
                      <div style={{ display:'flex', flexDirection:'column' }}>
                        <label style={S.label}>Role</label>
                        <select style={S.input} value={newUser.role} onChange={e => setNewUser({...newUser, role:e.target.value})}>
                          <option>Staff</option><option>Secretary</option><option>Director</option>
                        </select>
                      </div>
                      <FormField label="Department" value={newUser.department} onChange={e => setNewUser({...newUser, department:e.target.value})} placeholder="e.g. Computer Science" />
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button style={S.saveBtn} onClick={handleAddUser}>Add User</button>
                      <button style={{ ...S.saveBtn, background:'#64748B' }} onClick={() => setShowAddUser(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                <div style={S.tableWrap}>
                  <div style={S.tableHead}>
                    {['Name','Email','Role','Department','Status','Actions'].map((h,i) => (
                      <div key={i} style={{ ...S.th, flex: i===0||i===1 ? 2 : 1 }}>{h}</div>
                    ))}
                  </div>
                  {users.length === 0 ? (
                    <div style={S.emptyMsg}>No users found</div>
                  ) : users.map((u, i) => (
                    <div key={i} style={S.tableRow}>
                      <div style={{ ...S.td, flex:2, fontWeight:'600' }}>{u.name}</div>
                      <div style={{ ...S.td, flex:2, fontSize:'10px' }}>{u.email}</div>
                      <div style={{ ...S.td, flex:1 }}>
                        <span style={{ ...S.pill, background:roleBg[u.role]||'#EFF6FF', color:roleColor[u.role]||'#1A3A6B' }}>{u.role}</span>
                      </div>
                      <div style={{ ...S.td, flex:1, fontSize:'10px' }}>{u.department || '—'}</div>
                      <div style={{ ...S.td, flex:1 }}>
                        <span style={{ ...S.pill, background:u.status==='active'?'#DCFCE7':'#FEE2E2', color:u.status==='active'?'#166534':'#991B1B' }}>{u.status}</span>
                      </div>
                      <div style={{ ...S.td, flex:1, gap:'4px', flexWrap:'wrap' }}>
                        <button style={{ ...S.actionBtn, background:u.status==='active'?'#FEF3C7':'#DCFCE7', color:u.status==='active'?'#92400E':'#166534' }}
                          onClick={() => handleDeactivate(u.id, u.status)}>
                          {u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        {role === 'Director' && (
                          <button style={{ ...S.actionBtn, background:'#FEE2E2', color:'#991B1B' }} onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── DEPARTMENTS ── */}
          {activeTab === 'departments' && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardTitle}>🏢 Department Management</span>
                {canAdmin && <button style={S.addBtn} onClick={() => setShowAddDept(!showAddDept)}>+ Add Department</button>}
              </div>
              <div style={S.cardBody}>
                <div style={{ ...S.noteBox, marginBottom:'16px', background:'#FFFBEB', border:'1px solid #FDE68A', color:'#92400E' }}>
        💡        Departments added here appear in the Meeting Requests form when Staff submit requests, in Reports (requests per department), and when assigning tasks. Keep this list up to date.
                </div>
                {showAddDept && canAdmin && (
                  <div style={S.addForm}>
                    <div style={S.formGrid}>
                      <FormField label="Department Name *" value={newDept.name} onChange={e => setNewDept({...newDept, name:e.target.value})} placeholder="e.g. Computer Science" />
                      <FormField label="Head of Department" value={newDept.head} onChange={e => setNewDept({...newDept, head:e.target.value})} placeholder="e.g. Dr. Sharma" />
                    </div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <button style={S.saveBtn} onClick={handleAddDept}>Add</button>
                      <button style={{ ...S.saveBtn, background:'#64748B' }} onClick={() => setShowAddDept(false)}>Cancel</button>
                    </div>
                  </div>
                )}
                <div style={S.tableWrap}>
                  <div style={S.tableHead}>
                    {['Department','Head','Status','Actions'].map((h,i) => (
                      <div key={i} style={{ ...S.th, flex: i===0||i===1 ? 2 : 1 }}>{h}</div>
                    ))}
                  </div>
                  {departments.length === 0 ? (
                    <div style={S.emptyMsg}>No departments found</div>
                  ) : departments.map((d, i) => (
                    <div key={i} style={S.tableRow}>
                      <div style={{ ...S.td, flex:2, fontWeight:'600' }}>{d.name}</div>
                      <div style={{ ...S.td, flex:2, fontSize:'10px' }}>{d.head || '—'}</div>
                      <div style={{ ...S.td, flex:1 }}>
                        <span style={{ ...S.pill, background:d.status==='active'?'#DCFCE7':'#FEE2E2', color:d.status==='active'?'#166534':'#991B1B' }}>{d.status}</span>
                      </div>
                      <div style={{ ...S.td, flex:1, gap:'4px' }}>
                        {canAdmin && (
                          <button style={{ ...S.actionBtn, background:d.status==='active'?'#FEF3C7':'#DCFCE7', color:d.status==='active'?'#92400E':'#166534' }}
                            onClick={() => handleToggleDeptStatus(d.id, d.status)}>
                            {d.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {role === 'Director' && (
                          <button style={{ ...S.actionBtn, background:'#FEE2E2', color:'#991B1B' }} onClick={() => handleDeleteDept(d.id)}>Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PERMISSIONS ── */}
          {activeTab === 'permissions' && (
  <div style={S.card}>
    <div style={S.cardHeader}>
      <span style={S.cardTitle}>🔐 Role Permissions</span>
      {role !== 'Director' && (
        <span style={{ fontSize:'10px', color:'#92400E', background:'#FEF3C7', padding:'3px 10px', borderRadius:'10px', fontWeight:'600' }}>
          👁 View Only — Director can edit
        </span>
      )}
    </div>
    <div style={S.cardBody}>
      <div style={S.tableWrap}>
        <div style={S.tableHead}>
          {['Role','Module','View','Edit','Delete','Approve'].map((h,i) => (
            <div key={i} style={{ ...S.th, flex: i<2 ? 1.5 : 0.8 }}>{h}</div>
          ))}
        </div>
        {permissions.length === 0 ? (
          <div style={S.emptyMsg}>No permissions found</div>
        ) : permissions.map((p, i) => (
          <div key={i} style={S.tableRow}>
            <div style={{ ...S.td, flex:1.5 }}>
              <span style={{ ...S.pill, background:roleBg[p.role]||'#EFF6FF', color:roleColor[p.role]||'#1A3A6B' }}>{p.role}</span>
            </div>
            <div style={{ ...S.td, flex:1.5, fontSize:'11px' }}>{p.module_name}</div>
            {['can_view','can_edit','can_delete','can_approve'].map(field => (
              <div key={field} style={{ ...S.td, flex:0.8 }}>
                <div
                  style={{
                    ...S.toggle,
                    background: p[field] ? '#1A3A6B' : '#E2E8F0',
                    cursor: role === 'Director' ? 'pointer' : 'not-allowed',
                    opacity: role === 'Director' ? 1 : 0.7,
                  }}
                  onClick={() => role === 'Director' && handleTogglePermission(p.id, field, p[field])}
                >
                  <div style={{ ...S.toggleDot, transform: p[field] ? 'translateX(20px)' : 'translateX(2px)' }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div style={S.card}>
              <div style={S.cardHeader}><span style={S.cardTitle}>🔔 Notification Preferences</span></div>
              <div style={S.cardBody}>
                {[
                  { key:'emailNotifs',       label:'Email Notifications',    desc:'Receive all notifications via email' },
                  { key:'meetingReminders',  label:'Meeting Reminders',       desc:'Get reminded 30 mins before meetings' },
                  { key:'taskDeadlines',     label:'Task Deadline Alerts',    desc:'Alert when task deadline is approaching' },
                  { key:'visitorAlerts',     label:'Visitor Alerts',          desc:'Notify when a visitor appointment is confirmed' },
                  { key:'requestUpdates',    label:'Request Status Updates',  desc:'Notify when your request is approved/rejected' },
                ].map((n, i) => (
                  <div key={i} style={S.notifRow}>
                    <div>
                      <div style={S.notifLabel}>{n.label}</div>
                      <div style={S.notifDesc}>{n.desc}</div>
                    </div>
                    <div style={{ ...S.toggle, background:notifPrefs[n.key] ? '#1A3A6B' : '#E2E8F0' }}
                      onClick={() => setNotifPrefs({...notifPrefs, [n.key]: !notifPrefs[n.key]})}>
                      <div style={{ ...S.toggleDot, transform:notifPrefs[n.key] ? 'translateX(20px)' : 'translateX(2px)' }} />
                    </div>
                  </div>
                ))}
                <button style={{ ...S.saveBtn, marginTop:'14px' }} onClick={handleSaveNotifPrefs}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div style={S.card}>
              <div style={S.cardHeader}><span style={S.cardTitle}>🛡️ Security</span></div>
              <div style={S.cardBody}>
                <div style={S.dangerZone}>
                  <div style={S.dangerTitle}>⚠️ Session Management</div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontSize:'12px', fontWeight:'600', color:'#1E293B' }}>Logout from this device</div>
                      <div style={{ fontSize:'10px', color:'#94A3B8' }}>This will end your current session</div>
                    </div>
                    <button style={S.dangerBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
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

// ── Reusable form field ─────────────────────────────────
function FormField({ label, value, onChange, placeholder, type='text', disabled=false }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', marginBottom:'14px' }}>
      <label style={{ fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' }}>{label}</label>
      <input
        style={{ border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', background:disabled?'#F8FAFC':'#fff', color:disabled?'#94A3B8':'#1E293B' }}
        type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      />
    </div>
  );
}

const S = {
  page:           { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F5F7FA', overflow:'hidden' },
  sidebar:        { width:'200px', background:'#fff', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', borderRight:'1px solid #E2E8F0', boxShadow:'1px 0 4px rgba(0,0,0,0.06)' },
  logoWrap:       { padding:'14px 16px 12px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'center' },
  logo:           { width:'130px', objectFit:'contain' },
  portalBanner:   { padding:'14px 16px', borderBottom:'1px solid #E2E8F0' },
  portalName:     { color:'#1A3A6B', fontSize:'13px', fontWeight:'700', lineHeight:1.4, marginBottom:'4px' },
  portalDate:     { color:'#64748B', fontSize:'11px', fontWeight:'500' },
  divider:        { height:'1px',  margin:'4px 0' },
  navItem:        { padding:'10px 16px', cursor:'pointer', fontSize:'12px', color:'#475569', fontWeight:'500', borderLeft:'3px solid transparent', transition:'all 0.2s ease', userSelect:'none', display:'flex', alignItems:'center' },
  navActive:      { background:'#EFF6FF', color:'#1A3A6B', borderLeft:'3px solid #2563EB', fontWeight:'700' },
  navIcon:        { fontSize:'14px', marginRight:'8px', flexShrink:0 },
  main:           { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:         { background:'#fff', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser:     { display:'flex', alignItems:'center', gap:'10px' },
  topbarAvatar:   { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0 },
  topbarUserName: { color:'#1A3A6B', fontSize:'13px', fontWeight:'700' },
  topbarUserEmail:{ color:'#94A3B8', fontSize:'9px' },
  topbarUserRole: { color:'#64748B', fontSize:'10px' },
  topbarRight:    { display:'flex', alignItems:'center', gap:'8px' },
  notifWrap:      { position:'relative', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:'6px', padding:'6px 10px', color:'#1A3A6B', fontSize:'14px', cursor:'pointer' },
  notifBadge:     { position:'absolute', top:'-5px', right:'-5px', background:'#EF4444', color:'#fff', borderRadius:'50%', width:'14px', height:'14px', fontSize:'8px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' },
  btnOutline:     { background:'transparent', color:'#1A3A6B', border:'1px solid #1A3A6B', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  btnLogout:      { background:'#DC2626', color:'#fff', border:'none', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  tabs:           { display:'flex', gap:'4px', marginBottom:'14px', background:'#F1F5F9', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', flexWrap:'wrap' },
  tab:            { padding:'6px 14px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  card:           { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'14px' },
  cardHeader:     { padding:'13px 16px 10px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle:      { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  cardBody:       { padding:'20px' },
  avatarSection:  { display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px', paddingBottom:'20px', borderBottom:'1px solid #F1F5F9' },
  bigAvatar:      { width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(135deg,#1A3A6B,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', color:'#fff', flexShrink:0 },
  avatarName:     { fontSize:'15px', fontWeight:'700', color:'#1E293B', marginBottom:'3px' },
  avatarRole:     { fontSize:'11px', color:'#64748B' },
  formGrid:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' },
  label:          { fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:          { border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  noteBox:        { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#1E40AF', lineHeight:1.5 },
  rulesBox:       { background:'#F8FAFC', borderRadius:'8px', padding:'12px 14px', marginBottom:'14px' },
  saveBtn:        { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 22px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  addBtn:         { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'6px', padding:'6px 14px', fontSize:'11px', fontWeight:'600', cursor:'pointer' },
  addForm:        { background:'#F8FAFC', borderRadius:'10px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'16px' },
  tableWrap:      { border:'1px solid #E2E8F0', borderRadius:'10px', overflow:'hidden' },
  tableHead:      { display:'flex', background:'#F8FAFC', padding:'10px 14px', borderBottom:'1px solid #E2E8F0' },
  th:             { fontSize:'10px', fontWeight:'700', color:'#64748B', textTransform:'uppercase' },
  tableRow:       { display:'flex', alignItems:'center', padding:'10px 14px', borderBottom:'1px solid #F8FAFC' },
  td:             { display:'flex', alignItems:'center', fontSize:'11px', color:'#1E293B', paddingRight:'8px' },
  pill:           { fontSize:'9px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px' },
  actionBtn:      { fontSize:'9px', fontWeight:'600', padding:'4px 8px', borderRadius:'6px', border:'none', cursor:'pointer', marginRight:'4px' },
  notifRow:       { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #F8FAFC' },
  notifLabel:     { fontSize:'12px', fontWeight:'600', color:'#1E293B', marginBottom:'2px' },
  notifDesc:      { fontSize:'10px', color:'#94A3B8' },
  toggle:         { width:'44px', height:'24px', borderRadius:'12px', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 },
  toggleDot:      { width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', transition:'transform 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' },
  dangerZone:     { background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:'10px', padding:'14px' },
  dangerTitle:    { fontSize:'11px', fontWeight:'700', color:'#991B1B', marginBottom:'10px' },
  dangerBtn:      { background:'#FEE2E2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:'8px', padding:'8px 16px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  emptyMsg:       { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Settings;