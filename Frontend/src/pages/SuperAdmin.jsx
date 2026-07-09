import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1A3A6B';
  return (
    <div style={{ position:'fixed', top:'20px', right:'20px', background:bg, color:'#fff', padding:'12px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:'600', zIndex:9999, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:'8px' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {message}
    </div>
  );
}

function SuperAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  // Data states
  const [dashStats, setDashStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketComments, setTicketComments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [sysHealth, setSysHealth] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name:'', email:'', password:'', role:'Staff', department:'' });
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDept, setNewDept] = useState({ name:'', head:'' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastRole, setBroadcastRole] = useState('all');
  const [newComment, setNewComment] = useState('');
  const [resetPassId, setResetPassId] = useState(null);
  const [newPass, setNewPass] = useState('');

  const name = localStorage.getItem('name') || 'Super Admin';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const tabs = [
    { key:'dashboard',   label:'Dashboard',   icon:'🏠' },
    { key:'users',       label:'Users',        icon:'👥' },
    { key:'departments', label:'Departments',  icon:'🏢' },
    { key:'permissions', label:'Permissions',  icon:'🔐' },
    { key:'tickets',     label:'Support',      icon:'🎫' },
    { key:'audit',       label:'Audit Logs',   icon:'📋' },
    { key:'health',      label:'System Health',icon:'💻' },
    { key:'broadcast',   label:'Broadcast',    icon:'📢' },
    { key:'reports',     label:'Reports',      icon:'📊' },
  ];

  useEffect(() => {
    if (activeTab === 'dashboard')   fetchDashboard();
    if (activeTab === 'users')       fetchUsers();
    if (activeTab === 'departments') fetchDepts();
    if (activeTab === 'permissions') fetchPerms();
    if (activeTab === 'tickets')     fetchTickets();
    if (activeTab === 'audit')       fetchAudit();
    if (activeTab === 'health')      fetchHealth();
    if (activeTab === 'reports')     fetchReports();
  }, [activeTab]);

  const fetchDashboard   = async () => { try { const r = await API.get('/superadmin/dashboard'); if (r.data.success) setDashStats(r.data.data); } catch {} };
  const fetchUsers       = async () => { try { const r = await API.get('/superadmin/users'); if (r.data.success) setUsers(r.data.data); } catch {} };
  const fetchDepts       = async () => { try { const r = await API.get('/superadmin/departments'); if (r.data.success) setDepartments(r.data.data); } catch {} };
  const fetchPerms       = async () => { try { const r = await API.get('/superadmin/permissions'); if (r.data.success) setPermissions(r.data.data); } catch {} };
  const fetchTickets     = async () => { try { const r = await API.get('/superadmin/tickets'); if (r.data.success) setTickets(r.data.data); } catch {} };
  const fetchAudit       = async () => { try { const r = await API.get('/superadmin/audit-logs'); if (r.data.success) setAuditLogs(r.data.data); } catch {} };
  const fetchHealth      = async () => { try { const r = await API.get('/superadmin/system-health'); if (r.data.success) setSysHealth(r.data.data); } catch {} };
  const fetchReports     = async () => { try { const r = await API.get('/superadmin/reports'); if (r.data.success) setReports(r.data.data); } catch {} };

  const fetchTicketComments = async (id) => {
    try { const r = await API.get(`/superadmin/tickets/${id}/comments`); if (r.data.success) setTicketComments(r.data.data); } catch {}
  };

  // Users
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) { showToast('Name, email and password required', 'error'); return; }
    try {
      const r = await API.post('/superadmin/users', newUser);
      if (r.data.success) { showToast('User created!'); setShowAddUser(false); setNewUser({ name:'', email:'', password:'', role:'Staff', department:'' }); fetchUsers(); }
      else showToast(r.data.message, 'error');
    } catch { showToast('Failed to create user', 'error'); }
  };

  const handleToggleStatus = async (id) => {
    try { const r = await API.put(`/superadmin/users/${id}/toggle-status`); if (r.data.success) { showToast(`User ${r.data.data.status}`); fetchUsers(); } } catch { showToast('Failed', 'error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    try { const r = await API.delete(`/superadmin/users/${id}`); if (r.data.success) { showToast('User deleted'); fetchUsers(); } } catch { showToast('Failed', 'error'); }
  };

  const handleResetPass = async () => {
    if (!newPass || newPass.length < 6) { showToast('Minimum 6 characters', 'error'); return; }
    try { const r = await API.put(`/superadmin/users/${resetPassId}/reset-password`, { newPassword: newPass }); if (r.data.success) { showToast('Password reset!'); setResetPassId(null); setNewPass(''); } } catch { showToast('Failed', 'error'); }
  };

  // Departments
  const handleAddDept = async () => {
    if (!newDept.name) { showToast('Department name required', 'error'); return; }
    try { const r = await API.post('/superadmin/departments', newDept); if (r.data.success) { showToast('Department added!'); setShowAddDept(false); setNewDept({ name:'', head:'' }); fetchDepts(); } } catch { showToast('Failed', 'error'); }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try { const r = await API.delete(`/superadmin/departments/${id}`); if (r.data.success) { showToast('Deleted'); fetchDepts(); } } catch { showToast('Failed', 'error'); }
  };

  // Permissions
  const handleTogglePerm = async (id, field, current) => {
    const perm = permissions.find(p => p.id === id);
    try { await API.put(`/superadmin/permissions/${id}`, { ...perm, [field]: current ? 0 : 1 }); fetchPerms(); } catch { showToast('Failed', 'error'); }
  };

  // Tickets
  const handleTicketStatus = async (id, status) => {
    try { const r = await API.put(`/superadmin/tickets/${id}/status`, { status }); if (r.data.success) { showToast(`Ticket marked ${status}`); fetchTickets(); if (selectedTicket?.id === id) setSelectedTicket(prev => ({ ...prev, status })); } } catch { showToast('Failed', 'error'); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try { const r = await API.post(`/superadmin/tickets/${selectedTicket.id}/comments`, { comment: newComment }); if (r.data.success) { setNewComment(''); fetchTicketComments(selectedTicket.id); } } catch { showToast('Failed', 'error'); }
  };

  // Broadcast
  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) { showToast('Message required', 'error'); return; }
    try { const r = await API.post('/superadmin/broadcast', { message: broadcastMsg, target_role: broadcastRole }); if (r.data.success) { showToast(r.data.message); setBroadcastMsg(''); } } catch { showToast('Failed', 'error'); }
  };

  const roleBg    = { Director:'#FEE2E2', Secretary:'#DBEAFE', Staff:'#DCFCE7', Faculty:'#FEF3C7', SuperAdmin:'#EDE9FE' };
  const roleColor = { Director:'#991B1B', Secretary:'#1E40AF', Staff:'#166534', Faculty:'#92400E', SuperAdmin:'#5B21B6' };
  const stBg      = { Open:'#DBEAFE', 'In Progress':'#FEF3C7', Resolved:'#DCFCE7', Closed:'#F1F5F9' };
  const stColor   = { Open:'#1E40AF', 'In Progress':'#92400E', Resolved:'#166534', Closed:'#64748B' };
  const priColor  = { Low:'#166534', Medium:'#92400E', High:'#991B1B', Critical:'#7C3AED' };
  const priBg     = { Low:'#DCFCE7', Medium:'#FEF3C7', High:'#FEE2E2', Critical:'#EDE9FE' };

  return (
    <div style={S.page}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logoWrap}><img src={lnmiitLogo} alt="LNMIIT" style={S.logo} /></div>
        <div style={S.portalBanner}>
          <div style={S.portalName}>Super Admin</div>
          <div style={S.portalDate}>{today}</div>
        </div>
        <div style={S.divider} />
        {tabs.map((tab, i) => (
          <div key={i}
            style={{ ...S.navItem, ...(activeTab === tab.key ? S.navActive : {}) }}
            onClick={() => setActiveTab(tab.key)}
          >
            <span style={S.navIcon}>{tab.icon}</span>{tab.label}
          </div>
        ))}
        <div style={{ marginTop:'auto', padding:'14px 16px', borderTop:'1px solid #E2E8F0' }}>
          <button style={{ ...S.addBtn, width:'100%', background:'#DC2626' }}
            onClick={() => { localStorage.clear(); navigate('/'); }}>
            ⏻ Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <div style={S.topbar}>
          <div style={S.topbarUser}>
            <div style={S.topbarAvatar}>{initials}</div>
            <div>
              <div style={S.topbarUserName}>{name}</div>
              <div style={S.topbarUserRole}>Super Administrator</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'11px', color:'#64748B' }}>{today}</span>
          </div>
        </div>

        <div style={S.content}>

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>🏠 Super Admin Dashboard</div><div style={S.pageSub}>Platform overview and quick actions</div></div>
                <button style={S.addBtn} onClick={fetchDashboard}>↻ Refresh</button>
              </div>
              {dashStats && (
                <>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
                    {[
                      { label:'Total Users',       val:dashStats.totalUsers,      bg:'#EFF6FF', color:'#1A3A6B', icon:'👥' },
                      { label:'Active Users',      val:dashStats.activeUsers,     bg:'#DCFCE7', color:'#166534', icon:'✅' },
                      { label:'Open Tickets',      val:dashStats.openTickets,     bg:'#FEE2E2', color:'#991B1B', icon:'🎫' },
                      { label:'Pending Requests',  val:dashStats.pendingRequests, bg:'#FEF3C7', color:'#92400E', icon:'📋' },
                      { label:'Pending Visitors',  val:dashStats.pendingVisitors, bg:'#EDE9FE', color:'#5B21B6', icon:'👤' },
                      { label:'Departments',       val:dashStats.totalDepts,      bg:'#F0FDF4', color:'#166534', icon:'🏢' },
                      { label:'Pending Tickets',   val:dashStats.pendingTickets,  bg:'#FEF3C7', color:'#92400E', icon:'⏳' },
                      { label:'Actions Today',     val:dashStats.auditToday,      bg:'#EFF6FF', color:'#1A3A6B', icon:'📝' },
                    ].map((s, i) => (
                      <div key={i} style={{ ...S.statCard, background:s.bg }}>
                        <div style={{ fontSize:'22px', marginBottom:'4px' }}>{s.icon}</div>
                        <div style={{ fontSize:'22px', fontWeight:'700', color:s.color, lineHeight:1 }}>{s.val}</div>
                        <div style={{ fontSize:'10px', color:'#64748B', fontWeight:'600', marginTop:'4px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div style={{ ...S.card, marginBottom:'14px' }}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>⚡ Quick Actions</span></div>
                    <div style={{ padding:'14px', display:'flex', gap:'10px', flexWrap:'wrap' }}>
                      {[
                        { label:'+ Add User',        action:() => setActiveTab('users'),       bg:'#1A3A6B' },
                        { label:'+ Add Department',  action:() => setActiveTab('departments'), bg:'#166534' },
                        { label:'📢 Broadcast',      action:() => setActiveTab('broadcast'),   bg:'#92400E' },
                        { label:'📋 Audit Logs',     action:() => setActiveTab('audit'),       bg:'#5B21B6' },
                        { label:'💻 System Health',  action:() => setActiveTab('health'),      bg:'#0EA5E9' },
                      ].map((a, i) => (
                        <button key={i} style={{ ...S.addBtn, background:a.bg }} onClick={a.action}>{a.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Audit Logs */}
                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>📋 Recent Activity</span></div>
                    <div style={{ overflowX:'auto' }}>
                      {dashStats.recentLogs?.map((log, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC', background: i%2===0?'#fff':'#FAFAFA' }}>
                          <div style={{ fontSize:'10px', color:'#64748B', width:'130px', flexShrink:0 }}>{new Date(log.timestamp).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' })}</div>
                          <div style={{ width:'80px', flexShrink:0 }}>
                            <span style={{ ...S.pill, background:roleBg[log.user_role]||'#EFF6FF', color:roleColor[log.user_role]||'#1A3A6B' }}>{log.user_role||'System'}</span>
                          </div>
                          <div style={{ fontSize:'11px', color:'#64748B', width:'80px', flexShrink:0 }}>{log.module}</div>
                          <div style={{ fontSize:'11px', color:'#1E293B', flex:1 }}>{log.action}</div>
                          <div style={{ fontSize:'10px', color:'#94A3B8' }}>{log.user_name||'—'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>👥 User Management</div><div style={S.pageSub}>Create, edit, activate and manage all portal users</div></div>
                <button style={S.addBtn} onClick={() => setShowAddUser(!showAddUser)}>+ Add User</button>
              </div>

              {showAddUser && (
                <div style={S.formCard}>
                  <div style={S.cardTitle}>Create New User</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'12px' }}>
                    {[
                      { label:'Full Name *', key:'name', placeholder:'Full name' },
                      { label:'Email *', key:'email', placeholder:'email@lnmiit.ac.in', type:'email' },
                      { label:'Password *', key:'password', placeholder:'Initial password', type:'password' },
                      { label:'Department', key:'department', placeholder:'e.g. Computer Science' },
                    ].map((f, i) => (
                      <div key={i}>
                        <label style={S.label}>{f.label}</label>
                        <input style={S.input} type={f.type||'text'} placeholder={f.placeholder}
                          value={newUser[f.key]} onChange={e => setNewUser({...newUser, [f.key]:e.target.value})} />
                      </div>
                    ))}
                    <div>
                      <label style={S.label}>Role *</label>
                      <select style={S.input} value={newUser.role} onChange={e => setNewUser({...newUser, role:e.target.value})}>
                        {['Staff','Secretary','Director','Faculty'].map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
                    <button style={S.addBtn} onClick={handleAddUser}>Create User</button>
                    <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => setShowAddUser(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {resetPassId && (
                <div style={{ ...S.formCard, background:'#FEF3C7', border:'1px solid #FDE68A' }}>
                  <div style={S.cardTitle}>🔒 Reset Password</div>
                  <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                    <input style={{ ...S.input, flex:1 }} type="password" placeholder="New password (min 6 chars)"
                      value={newPass} onChange={e => setNewPass(e.target.value)} />
                    <button style={S.addBtn} onClick={handleResetPass}>Reset</button>
                    <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => { setResetPassId(null); setNewPass(''); }}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={S.card}>
                <div style={S.tableHead}>
                  {['Name','Email','Role','Department','Status','Actions'].map((h, i) => (
                    <div key={i} style={{ ...S.th, flex: i===0||i===1 ? 2 : 1 }}>{h}</div>
                  ))}
                </div>
                {users.length === 0 ? <div style={S.emptyMsg}>No users found</div> : users.map((u, i) => (
                  <div key={i} style={S.tableRow}>
                    <div style={{ ...S.td, flex:2, fontWeight:'600' }}>{u.name}</div>
                    <div style={{ ...S.td, flex:2, fontSize:'10px' }}>{u.email}</div>
                    <div style={{ ...S.td, flex:1 }}>
                      <span style={{ ...S.pill, background:roleBg[u.role]||'#EFF6FF', color:roleColor[u.role]||'#1A3A6B' }}>{u.role}</span>
                    </div>
                    <div style={{ ...S.td, flex:1, fontSize:'10px' }}>{u.department||'—'}</div>
                    <div style={{ ...S.td, flex:1 }}>
                      <span style={{ ...S.pill, background:u.status==='active'?'#DCFCE7':'#FEE2E2', color:u.status==='active'?'#166534':'#991B1B' }}>{u.status}</span>
                    </div>
                    <div style={{ ...S.td, flex:1, gap:'4px', flexWrap:'wrap' }}>
                      <button style={{ ...S.actionBtn, background:u.status==='active'?'#FEF3C7':'#DCFCE7', color:u.status==='active'?'#92400E':'#166534' }}
                        onClick={() => handleToggleStatus(u.id)}>
                        {u.status==='active'?'Deactivate':'Activate'}
                      </button>
                      <button style={{ ...S.actionBtn, background:'#EFF6FF', color:'#1A3A6B' }}
                        onClick={() => { setResetPassId(u.id); setNewPass(''); }}>
                        🔑 Reset
                      </button>
                      <button style={{ ...S.actionBtn, background:'#FEE2E2', color:'#991B1B' }}
                        onClick={() => handleDeleteUser(u.id)}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── DEPARTMENTS ── */}
          {activeTab === 'departments' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>🏢 Department Management</div><div style={S.pageSub}>Manage all institute departments</div></div>
                <button style={S.addBtn} onClick={() => setShowAddDept(!showAddDept)}>+ Add Department</button>
              </div>

              {showAddDept && (
                <div style={S.formCard}>
                  <div style={{ display:'flex', gap:'10px' }}>
                    <div style={{ flex:2 }}>
                      <label style={S.label}>Department Name *</label>
                      <input style={S.input} placeholder="e.g. Computer Science" value={newDept.name} onChange={e => setNewDept({...newDept, name:e.target.value})} />
                    </div>
                    <div style={{ flex:2 }}>
                      <label style={S.label}>Head of Department</label>
                      <input style={S.input} placeholder="e.g. Dr. Sharma" value={newDept.head} onChange={e => setNewDept({...newDept, head:e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px', marginTop:'10px' }}>
                    <button style={S.addBtn} onClick={handleAddDept}>Add Department</button>
                    <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => setShowAddDept(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={S.card}>
                <div style={S.tableHead}>
                  {['Department Name','Head','Status','Actions'].map((h, i) => (
                    <div key={i} style={{ ...S.th, flex: i<2 ? 2 : 1 }}>{h}</div>
                  ))}
                </div>
                {departments.length === 0 ? <div style={S.emptyMsg}>No departments found</div>
                : departments.map((d, i) => (
                  <div key={i} style={S.tableRow}>
                    <div style={{ ...S.td, flex:2, fontWeight:'600' }}>{d.name}</div>
                    <div style={{ ...S.td, flex:2, fontSize:'11px' }}>{d.head||'—'}</div>
                    <div style={{ ...S.td, flex:1 }}>
                      <span style={{ ...S.pill, background:d.status==='active'?'#DCFCE7':'#FEE2E2', color:d.status==='active'?'#166534':'#991B1B' }}>{d.status}</span>
                    </div>
                    <div style={{ ...S.td, flex:1, gap:'4px' }}>
                      <button style={{ ...S.actionBtn, background:'#FEE2E2', color:'#991B1B' }} onClick={() => handleDeleteDept(d.id)}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── PERMISSIONS ── */}
          {activeTab === 'permissions' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>🔐 Role Permissions (RBAC)</div><div style={S.pageSub}>Configure module-level access for each role</div></div>
              </div>
              <div style={S.card}>
                <div style={S.tableHead}>
                  {['Role','Module','View','Edit','Delete','Approve'].map((h, i) => (
                    <div key={i} style={{ ...S.th, flex: i<2 ? 1.5 : 0.8 }}>{h}</div>
                  ))}
                </div>
                {permissions.length === 0 ? <div style={S.emptyMsg}>No permissions found</div>
                : permissions.map((p, i) => (
                  <div key={i} style={S.tableRow}>
                    <div style={{ ...S.td, flex:1.5 }}>
                      <span style={{ ...S.pill, background:roleBg[p.role]||'#EFF6FF', color:roleColor[p.role]||'#1A3A6B' }}>{p.role}</span>
                    </div>
                    <div style={{ ...S.td, flex:1.5, fontSize:'11px' }}>{p.module_name}</div>
                    {['can_view','can_edit','can_delete','can_approve'].map(field => (
                      <div key={field} style={{ ...S.td, flex:0.8 }}>
                        <div style={{ ...S.toggle, background:p[field]?'#1A3A6B':'#E2E8F0', cursor:'pointer' }}
                          onClick={() => handleTogglePerm(p.id, field, p[field])}>
                          <div style={{ ...S.toggleDot, transform:p[field]?'translateX(20px)':'translateX(2px)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── SUPPORT TICKETS ── */}
          {activeTab === 'tickets' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>🎫 Support Center</div><div style={S.pageSub}>Manage all support tickets from users</div></div>
                <button style={S.addBtn} onClick={fetchTickets}>↻ Refresh</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' }}>
                {/* Ticket List */}
                <div style={{ display:'flex', flexDirection:'column', gap:'8px', overflowY:'auto', maxHeight:'calc(100vh - 220px)' }}>
                  {tickets.length === 0 ? <div style={S.emptyMsg}>No tickets found</div>
                  : tickets.map((t, i) => (
                    <div key={i}
                      style={{ ...S.ticketCard, ...(selectedTicket?.id===t.id ? { border:'2px solid #2563EB', background:'#EFF6FF' } : {}) }}
                      onClick={() => { setSelectedTicket(t); fetchTicketComments(t.id); }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'700', color:'#1E293B' }}>{t.subject}</span>
                        <span style={{ ...S.pill, background:stBg[t.status], color:stColor[t.status] }}>{t.status}</span>
                      </div>
                      <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                        <span style={{ ...S.pill, background:priBg[t.priority], color:priColor[t.priority] }}>{t.priority}</span>
                        <span style={{ ...S.pill, background:'#F1F5F9', color:'#475569' }}>{t.category}</span>
                      </div>
                      <div style={{ fontSize:'10px', color:'#64748B' }}>By: {t.raised_by_name} · {new Date(t.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                {/* Ticket Detail */}
                <div style={{ ...S.card, overflowY:'auto', maxHeight:'calc(100vh - 200px)' }}>
                  {selectedTicket ? (
                    <>
                      <div style={{ padding:'14px 16px', borderBottom:'1px solid #F1F5F9' }}>
                        <div style={{ fontSize:'14px', fontWeight:'700', color:'#1E293B', marginBottom:'8px' }}>{selectedTicket.subject}</div>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                          <span style={{ ...S.pill, background:stBg[selectedTicket.status], color:stColor[selectedTicket.status] }}>{selectedTicket.status}</span>
                          <span style={{ ...S.pill, background:priBg[selectedTicket.priority], color:priColor[selectedTicket.priority] }}>{selectedTicket.priority}</span>
                          <span style={{ ...S.pill, background:'#F1F5F9', color:'#475569' }}>{selectedTicket.category}</span>
                        </div>
                        <div style={{ fontSize:'11px', color:'#475569', background:'#F8FAFC', padding:'10px', borderRadius:'6px', marginBottom:'10px' }}>{selectedTicket.description}</div>
                        <div style={{ fontSize:'10px', color:'#94A3B8' }}>Raised by: {selectedTicket.raised_by_name} ({selectedTicket.raised_by_email})</div>
                      </div>

                      {/* Status actions */}
                      <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9' }}>
                        <div style={{ fontSize:'11px', fontWeight:'700', color:'#64748B', marginBottom:'8px' }}>UPDATE STATUS</div>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          {['Open','In Progress','Resolved','Closed'].filter(s => s !== selectedTicket.status).map(s => (
                            <button key={s} style={{ ...S.actionBtn, background:stBg[s], color:stColor[s] }}
                              onClick={() => handleTicketStatus(selectedTicket.id, s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comments */}
                      <div style={{ padding:'12px 16px' }}>
                        <div style={{ fontSize:'11px', fontWeight:'700', color:'#64748B', marginBottom:'8px' }}>COMMENTS ({ticketComments.length})</div>
                        <div style={{ maxHeight:'160px', overflowY:'auto', marginBottom:'10px' }}>
                          {ticketComments.length === 0 ? <div style={{ fontSize:'11px', color:'#94A3B8' }}>No comments yet</div>
                          : ticketComments.map((c, i) => (
                            <div key={i} style={{ background:'#F8FAFC', borderRadius:'6px', padding:'8px 10px', marginBottom:'6px' }}>
                              <div style={{ fontSize:'10px', fontWeight:'700', color:'#1A3A6B', marginBottom:'2px' }}>{c.commenter_name} ({c.commenter_role})</div>
                              <div style={{ fontSize:'11px', color:'#1E293B' }}>{c.comment}</div>
                              <div style={{ fontSize:'9px', color:'#94A3B8', marginTop:'2px' }}>{new Date(c.created_at).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' })}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:'flex', gap:'6px' }}>
                          <input style={{ ...S.input, flex:1 }} placeholder="Add a comment..."
                            value={newComment} onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                          <button style={S.addBtn} onClick={handleAddComment}>Send</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'200px', color:'#94A3B8' }}>
                      <div style={{ fontSize:'36px', marginBottom:'8px' }}>🎫</div>
                      <div style={{ fontSize:'13px', fontWeight:'600' }}>Select a ticket to view details</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── AUDIT LOGS ── */}
          {activeTab === 'audit' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>📋 Audit Logs</div><div style={S.pageSub}>Complete history of all system actions</div></div>
                <button style={S.addBtn} onClick={fetchAudit}>↻ Refresh</button>
              </div>
              <div style={S.card}>
                <div style={S.tableHead}>
                  {['Timestamp','User','Role','Module','Action'].map((h, i) => (
                    <div key={i} style={{ ...S.th, flex: i===4 ? 3 : 1 }}>{h}</div>
                  ))}
                </div>
                <div style={{ overflowY:'auto', maxHeight:'calc(100vh - 260px)' }}>
                  {auditLogs.length === 0 ? <div style={S.emptyMsg}>No audit logs found</div>
                  : auditLogs.map((log, i) => (
                    <div key={i} style={{ ...S.tableRow, background: i%2===0?'#fff':'#FAFAFA' }}>
                      <div style={{ ...S.td, flex:1, fontSize:'10px', color:'#64748B' }}>{new Date(log.timestamp).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' })}</div>
                      <div style={{ ...S.td, flex:1, fontSize:'11px' }}>{log.user_name||'System'}</div>
                      <div style={{ ...S.td, flex:1 }}>
                        {log.user_role && <span style={{ ...S.pill, background:roleBg[log.user_role]||'#EFF6FF', color:roleColor[log.user_role]||'#1A3A6B' }}>{log.user_role}</span>}
                      </div>
                      <div style={{ ...S.td, flex:1 }}>
                        <span style={{ ...S.pill, background:'#EFF6FF', color:'#1A3A6B' }}>{log.module}</span>
                      </div>
                      <div style={{ ...S.td, flex:3, fontSize:'11px', color:'#1E293B' }}>{log.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SYSTEM HEALTH ── */}
          {activeTab === 'health' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>💻 System Health</div><div style={S.pageSub}>Real-time server and database status</div></div>
                <button style={S.addBtn} onClick={fetchHealth}>↻ Refresh</button>
              </div>
              {sysHealth && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>🖥 Server Status</span></div>
                    <div style={{ padding:'16px' }}>
                      {[
                        { label:'Status',       value:sysHealth.server.status,         color:'#166534' },
                        { label:'Uptime',        value:sysHealth.server.uptime,         color:'#1A3A6B' },
                        { label:'Memory Used',   value:`${sysHealth.server.memory_used_mb} MB`, color:'#92400E' },
                        { label:'Memory Total',  value:`${sysHealth.server.memory_total_mb} MB`, color:'#64748B' },
                        { label:'Node.js',       value:sysHealth.server.node_version,   color:'#64748B' },
                      ].map((r, i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
                          <span style={{ fontSize:'11px', color:'#64748B', fontWeight:'600' }}>{r.label}</span>
                          <span style={{ fontSize:'11px', fontWeight:'700', color:r.color }}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>📊 Platform Stats</span></div>
                    <div style={{ padding:'16px' }}>
                      {[
                        { label:'Database',         value:sysHealth.database.status,            color: sysHealth.database.status==='Connected'?'#166534':'#991B1B' },
                        { label:'Active Users',     value:sysHealth.stats.active_users,         color:'#1A3A6B' },
                        { label:'Failed Logins Today', value:sysHealth.stats.failed_logins_today, color:sysHealth.stats.failed_logins_today>5?'#991B1B':'#166534' },
                        { label:'Actions Today',    value:sysHealth.stats.actions_today,        color:'#1A3A6B' },
                      ].map((r, i) => (
                        <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
                          <span style={{ fontSize:'11px', color:'#64748B', fontWeight:'600' }}>{r.label}</span>
                          <span style={{ fontSize:'11px', fontWeight:'700', color:r.color }}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── BROADCAST ── */}
          {activeTab === 'broadcast' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>📢 Broadcast Notification</div><div style={S.pageSub}>Send announcements to all or specific roles</div></div>
              </div>
              <div style={{ ...S.card, maxWidth:'600px' }}>
                <div style={S.cardHeader}><span style={S.cardTitle}>Send Broadcast</span></div>
                <div style={{ padding:'20px' }}>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={S.label}>Target Role</label>
                    <select style={S.input} value={broadcastRole} onChange={e => setBroadcastRole(e.target.value)}>
                      <option value="all">All Users</option>
                      <option value="Director">Director</option>
                      <option value="Secretary">Director Office</option>
                      <option value="Staff">Staff</option>
                      <option value="Faculty">Faculty</option>
                    </select>
                  </div>
                  <div style={{ marginBottom:'14px' }}>
                    <label style={S.label}>Message *</label>
                    <textarea style={{ ...S.input, height:'100px', resize:'vertical', width:'100%', boxSizing:'border-box' }}
                      placeholder="Type your broadcast message here..."
                      value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
                  </div>
                  <button style={{ ...S.addBtn, padding:'10px 24px' }} onClick={handleBroadcast}>📢 Send Broadcast</button>
                </div>
              </div>
            </>
          )}

          {/* ── REPORTS ── */}
          {activeTab === 'reports' && (
            <>
              <div style={S.pageHeader}>
                <div><div style={S.pageTitle}>📊 Reports & Analytics</div><div style={S.pageSub}>Platform-wide statistics and insights</div></div>
                <button style={S.addBtn} onClick={fetchReports}>↻ Refresh</button>
              </div>
              {reports && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>👥 Users by Role</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {reports.usersByRole?.map((r, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
                          <span style={{ ...S.pill, background:roleBg[r.role]||'#EFF6FF', color:roleColor[r.role]||'#1A3A6B', width:'80px', textAlign:'center' }}>{r.role}</span>
                          <div style={{ flex:1, height:'8px', background:'#F1F5F9', borderRadius:'4px' }}>
                            <div style={{ height:'100%', width:`${Math.min((r.count/Math.max(...reports.usersByRole.map(x=>x.count)))*100, 100)}%`, background:roleColor[r.role]||'#1A3A6B', borderRadius:'4px' }} />
                          </div>
                          <span style={{ fontSize:'12px', fontWeight:'700', color:'#1E293B', width:'24px', textAlign:'right' }}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>🎫 Tickets by Status</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {reports.ticketsByStatus?.map((r, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' }}>
                          <span style={{ ...S.pill, background:stBg[r.status]||'#EFF6FF', color:stColor[r.status]||'#1A3A6B' }}>{r.status}</span>
                          <span style={{ fontSize:'14px', fontWeight:'700', color:'#1E293B' }}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>🏢 Requests by Department</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {reports.requestsByDept?.length === 0 ? <div style={S.emptyMsg}>No data</div>
                      : reports.requestsByDept?.map((r, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                          <span style={{ fontSize:'11px', color:'#1E293B', flex:1 }}>{r.department||'Unknown'}</span>
                          <div style={{ width:'80px', height:'6px', background:'#F1F5F9', borderRadius:'3px' }}>
                            <div style={{ height:'100%', width:`${Math.min((r.count/Math.max(...reports.requestsByDept.map(x=>x.count)))*100, 100)}%`, background:'#2563EB', borderRadius:'3px' }} />
                          </div>
                          <span style={{ fontSize:'12px', fontWeight:'700', color:'#1A3A6B', width:'20px', textAlign:'right' }}>{r.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>📋 Recent Activity</span></div>
                    <div style={{ padding:'12px 16px', overflowY:'auto', maxHeight:'220px' }}>
                      {reports.recentActivity?.map((a, i) => (
                        <div key={i} style={{ padding:'6px 0', borderBottom:'1px solid #F8FAFC' }}>
                          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                            <span style={{ ...S.pill, background:roleBg[a.role]||'#EFF6FF', color:roleColor[a.role]||'#1A3A6B' }}>{a.role}</span>
                            <span style={{ fontSize:'11px', color:'#1E293B', flex:1 }}>{a.action}</span>
                            <span style={{ fontSize:'9px', color:'#94A3B8' }}>{new Date(a.timestamp).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

const S = {
  page:           { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F5F7FA', overflow:'hidden' },
  sidebar:        { width:'210px', background:'#fff', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', borderRight:'1px solid #E2E8F0', boxShadow:'1px 0 4px rgba(0,0,0,0.06)' },
  logoWrap:       { padding:'14px 16px 12px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'center' },
  logo:           { width:'130px', objectFit:'contain' },
  portalBanner:   { padding:'14px 16px', borderBottom:'1px solid #E2E8F0' },
  portalName:     { color:'#1A3A6B', fontSize:'13px', fontWeight:'700', lineHeight:1.4, marginBottom:'4px' },
  portalDate:     { color:'#64748B', fontSize:'10px', fontWeight:'500' },
  divider:        { height:'1px', background:'#E2E8F0', margin:'4px 0' },
  navItem:        { padding:'10px 16px', cursor:'pointer', fontSize:'12px', color:'#475569', fontWeight:'500', borderLeft:'3px solid transparent', transition:'all 0.2s ease', userSelect:'none', display:'flex', alignItems:'center', gap:'8px' },
  navActive:      { background:'#EFF6FF', color:'#1A3A6B', borderLeft:'3px solid #2563EB', fontWeight:'700' },
  navIcon:        { fontSize:'14px', flexShrink:0 },
  main:           { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:         { background:'#fff', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser:     { display:'flex', alignItems:'center', gap:'10px' },
  topbarAvatar:   { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#7C3AED,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0 },
  topbarUserName: { color:'#1A3A6B', fontSize:'13px', fontWeight:'700' },
  topbarUserRole: { color:'#64748B', fontSize:'10px' },
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:         { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  statCard:       { borderRadius:'10px', padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  card:           { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'14px' },
  cardHeader:     { padding:'12px 16px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle:      { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  formCard:       { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'14px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  tableHead:      { display:'flex', background:'#F8FAFC', padding:'10px 16px', borderBottom:'1px solid #E2E8F0' },
  th:             { fontSize:'10px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' },
  tableRow:       { display:'flex', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid #F8FAFC' },
  td:             { display:'flex', alignItems:'center', fontSize:'11px', color:'#1E293B', paddingRight:'8px' },
  pill:           { fontSize:'9px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px', whiteSpace:'nowrap' },
  actionBtn:      { fontSize:'9px', fontWeight:'600', padding:'4px 8px', borderRadius:'6px', border:'none', cursor:'pointer', marginRight:'4px' },
  label:          { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'5px' },
  input:          { border:'1px solid #E2E8F0', borderRadius:'6px', padding:'8px 12px', fontSize:'12px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" },
  emptyMsg:       { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
  toggle:         { width:'44px', height:'24px', borderRadius:'12px', position:'relative', transition:'background 0.2s', flexShrink:0 },
  toggleDot:      { width:'20px', height:'20px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', transition:'transform 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' },
  ticketCard:     { background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #E2E8F0', cursor:'pointer', transition:'all 0.15s ease' },
};

export default SuperAdmin;