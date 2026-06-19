import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import { useNotifCount } from '../hooks/useNotifCount';

function StaffPortal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const params = new URLSearchParams(location.search);
const initialTab = params.get('tab') || 'dashboard';
const [activeTab, setActiveTab] = useState(initialTab);
useEffect(() => {
  const p = new URLSearchParams(location.search);
  const tabFromUrl = p.get('tab');
  if (tabFromUrl) setActiveTab(tabFromUrl);
}, [location.search]);
  const [myRequests, setMyRequests] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [publicDocs, setPublicDocs] = useState([]);
  const [myVisitors, setMyVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState({ purpose: '', priority: 'Low', preferred_date: '', preferred_time: '', requester_name: '', department: '' });
  const [newVisitor, setNewVisitor] = useState({ name: '', organization: '', purpose: '', visit_date: '', visit_time: '' });
  const [staffPass, setStaffPass] = useState({ newPass: '', confirm: '' });
  const [hoveredNav, setHoveredNav] = useState(null);

  const name = localStorage.getItem('name') || 'User';
  const role = localStorage.getItem('role') || 'Staff';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const { count: notifCount } = useNotifCount();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, evRes, docRes, announcRes] = await Promise.all([
        API.get('/meetings/my'),
        API.get('/events/public'),
        API.get('/documents'),
        API.get('/announcements'),
      ]);
      if (reqRes.data.success) setMyRequests(reqRes.data.data);
      if (evRes.data.success) setPublicEvents(evRes.data.data);
      if (docRes.data.success) {
        setPublicDocs(docRes.data.data.filter(d => d.access_level === 'public'));
      }
      if (announcRes.data.success) setAnnouncements(announcRes.data.data.slice(0, 3));

      // My visitor requests — filtered locally by email since backend
      // doesn't yet expose a /visitors/my endpoint for Staff
      try {
        const visRes = await API.get('/visitors/my');
        if (visRes.data.success) setMyVisitors(visRes.data.data);
      } catch {
        setMyVisitors([]);
      }
    } catch (err) {
      console.log('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.purpose) { alert('Please enter purpose'); return; }
    if (!newRequest.requester_name) { alert('Please enter your name'); return; }
    try {
      const formData = new FormData();
      formData.append('purpose', newRequest.purpose);
      formData.append('priority', newRequest.priority);
      formData.append('preferred_date', newRequest.preferred_date);
      formData.append('preferred_time', newRequest.preferred_time);
      formData.append('requester_name', newRequest.requester_name);
      formData.append('department', newRequest.department);
      if (newRequest.attachment) formData.append('attachment', newRequest.attachment);

      const res = await API.post('/meetings/request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert('Meeting request submitted successfully!');
        setNewRequest({ purpose: '', priority: 'Low', preferred_date: '', preferred_time: '', requester_name: '', department: '' });
        setActiveTab('myrequests');
        fetchData();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to submit request');
    }
  };

  const handleSubmitVisitor = async () => {
    if (!newVisitor.name || !newVisitor.purpose || !newVisitor.visit_date) {
      alert('Please fill required fields');
      return;
    }
    try {
      const res = await API.post('/visitors/request', { ...newVisitor, invited_by: email });
      if (res.data.success) {
        alert('Visitor request submitted!');
        setNewVisitor({ name: '', organization: '', purpose: '', visit_date: '', visit_time: '' });
        fetchData();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to submit visitor request');
    }
  };

  const handleChangePassword = async () => {
    if (staffPass.newPass !== staffPass.confirm) {
      alert('Passwords do not match');
      return;
    }
    if (staffPass.newPass.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    try {
      const res = await API.post('/auth/reset-password', {
        email: email,
        newPassword: staffPass.newPass
      });
      if (res.data.success) {
        alert('Password updated successfully!');
        setStaffPass({ newPass: '', confirm: '' });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to update password');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const stBg = { Pending: '#FEF3C7', Approved: '#DCFCE7', Rejected: '#FEE2E2', Rescheduled: '#EDE9FE' };
  const stColor = { Pending: '#92400E', Approved: '#166534', Rejected: '#991B1B', Rescheduled: '#5B21B6' };
  const priBg = { High: '#FEE2E2', Medium: '#DBEAFE', Low: '#DCFCE7' };
  const priColor = { High: '#991B1B', Medium: '#1E40AF', Low: '#166534' };

  const navItems = [
    { key: 'dashboard',   label: 'Dashboard',         icon: '🏠' },
    { key: 'request',     label: 'Request Meeting',   icon: '📋' },
    { key: 'myrequests',  label: 'My Requests',       icon: '📌' },
    { key: 'calendar',    label: 'Public Calendar',   icon: '📅', external: true },
    { key: 'documents',   label: 'Documents',         icon: '📁' },
    { key: 'visitor',     label: 'Visitor Request',   icon: '👥' },
    { key: 'announcements', label: 'Announcements',   icon: '📢' },
    { key: 'settings',    label: 'Settings',          icon: '⚙️' },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div style={S.page}>

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logoWrap}>
          <img src={lnmiitLogo} alt="LNMIIT" style={S.logo} />
        </div>
        <div style={S.portalBanner}>
          <div style={S.portalName}>Director's Office Portal</div>
          <div style={S.portalDate}>{today}</div>
        </div>
        <div style={S.divider} />
        {navItems.map((item, i) => (
          <div key={i}
            style={{ ...S.navItem, ...(activeTab === item.key ? S.navActive : {}), ...(hoveredNav === i && activeTab !== item.key ? { background:'#F8FAFC', color:'#1A3A6B' } : {}) }}
            onMouseEnter={() => setHoveredNav(i)}
            onMouseLeave={() => setHoveredNav(null)}
            onClick={() => item.external ? navigate('/calendar') : setActiveTab(item.key)}>
            <span style={S.navIcon}>{item.icon}</span>
            {item.label}
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
              🔔
              {notifCount > 0 && <span style={S.notifBadge}>{notifCount}</span>}
            </div>
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div style={S.greeting}>
                {getGreeting()}, <span style={{ color: '#2563EB', fontWeight: '700' }}>{name}</span> &nbsp;|&nbsp; Have a productive day!
              </div>

              <div style={S.statGrid}>
                {[
                  { icon: '📋', label: 'My Requests',   value: myRequests.length, bg: '#EFF6FF' },
                  { icon: '⏳', label: 'Pending',        value: myRequests.filter(r => r.status === 'Pending').length, bg: '#FEF3C7' },
                  { icon: '✅', label: 'Approved',       value: myRequests.filter(r => r.status === 'Approved').length, bg: '#DCFCE7' },
                  { icon: '🔔', label: 'Notifications',  value: notifCount, bg: '#EDE9FE' },
                ].map((s, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={{ ...S.statIcon, background: s.bg }}>{s.icon}</div>
                    <div>
                      <div style={S.statNum}>{s.value}</div>
                      <div style={S.statLabel}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* QUICK ACTIONS */}
              <div style={S.quickActions}>
                <button style={S.actionBtn} onClick={() => setActiveTab('request')}>
                  📋 Request Meeting with Director
                </button>
                <button style={{ ...S.actionBtn, background: '#0EA5E9' }} onClick={() => setActiveTab('visitor')}>
                  👥 Register a Visitor
                </button>
                <button style={{ ...S.actionBtn, background: '#7C3AED' }} onClick={() => setActiveTab('myrequests')}>
                  📌 View My Requests
                </button>
              </div>

              {/* ANNOUNCEMENTS */}
              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>📢 Recent Announcements</span>
                  <span style={S.viewAll} onClick={() => setActiveTab('announcements')}>View all →</span>
                </div>
                {announcements.length === 0 ? (
                  <div style={S.empty}>No announcements</div>
                ) : announcements.map((a, i) => (
                  <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>{a.title}</div>
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>{a.content}</div>
                    <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '4px' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REQUEST MEETING TAB */}
          {activeTab === 'request' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>📋 Request Meeting with Director</span>
              </div>
              <div style={S.cardBody}>
                <div style={S.formGrid}>
                  <div style={S.formGroup}>
                    <label style={S.label}>Your Name *</label>
                    <input style={S.input} placeholder="Full name"
                      value={newRequest.requester_name || ''}
                      onChange={e => setNewRequest({ ...newRequest, requester_name: e.target.value })}
                    />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Department *</label>
                    <input style={S.input} placeholder="e.g. Computer Science"
                      value={newRequest.department || ''}
                      onChange={e => setNewRequest({ ...newRequest, department: e.target.value })}
                    />
                  </div>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Purpose of Meeting *</label>
                  <textarea style={{ ...S.input, height: '80px', resize: 'vertical' }}
                    placeholder="Describe the purpose of your meeting request..."
                    value={newRequest.purpose}
                    onChange={e => setNewRequest({ ...newRequest, purpose: e.target.value })}
                  />
                </div>
                <div style={S.formGrid}>
                  <div style={S.formGroup}>
                    <label style={S.label}>Priority</label>
                    <select style={S.input} value={newRequest.priority} onChange={e => setNewRequest({ ...newRequest, priority: e.target.value })}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Preferred Date</label>
                    <input style={S.input} type="date" min="2000-01-01" max="2099-12-31" value={newRequest.preferred_date} onChange={e => setNewRequest({ ...newRequest, preferred_date: e.target.value })} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Preferred Time</label>
                    <input style={S.input} type="time" value={newRequest.preferred_time} onChange={e => setNewRequest({ ...newRequest, preferred_time: e.target.value })} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Attach Document (optional)</label>
                    <input style={S.input} type="file" onChange={e => setNewRequest({ ...newRequest, attachment: e.target.files[0] })} />
                  </div>
                </div>
                <div style={S.noteBox}>
                  ℹ️ Your request will be reviewed by the Secretary and approved by the Director. You will be notified once a decision is made.
                </div>
                <button style={S.saveBtn} onClick={handleSubmitRequest}>Submit Request</button>
              </div>
            </div>
          )}

          {/* MY REQUESTS TAB */}
          {activeTab === 'myrequests' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>📌 My Meeting Requests</span>
              </div>
              {loading ? (
                <div style={S.empty}>Loading...</div>
              ) : myRequests.length === 0 ? (
                <div style={S.empty}>You haven't submitted any requests yet</div>
              ) : myRequests.map((req, i) => (
                <div key={i} style={S.reqItemFull}>
                  <div style={S.reqTopFull}>
                    <div style={S.reqPurpose}>{req.purpose}</div>
                    <span style={{ ...S.tag, background: stBg[req.status], color: stColor[req.status] }}>{req.status}</span>
                  </div>
                  <div style={S.reqMeta}>
                    <span style={{ ...S.tag, background: priBg[req.priority], color: priColor[req.priority] }}>{req.priority}</span>
                    <span style={S.reqDate}>📅 {req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : 'No date'}</span>
                    <span style={S.reqDate}>🕐 {req.preferred_time || 'No time'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CALENDAR TAB */}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>📁 Public Documents</span>
              </div>
              <div style={S.noteBox}>
                ℹ️ Only publicly accessible documents are shown here. Restricted and confidential files are not visible to Staff.
              </div>
              {loading ? (
                <div style={S.empty}>Loading...</div>
              ) : publicDocs.length === 0 ? (
                <div style={S.empty}>No public documents available</div>
              ) : publicDocs.map((doc, i) => (
                <div key={i} style={S.eventItem}>
                  <div style={{ flex: 1 }}>
                    <div style={S.eventTitle}>{doc.title}</div>
                    <div style={S.reqDate}>{doc.category} · v{doc.version || 1}</div>
                  </div>
                  <a href={doc.file_path} target="_blank" rel="noreferrer" style={S.viewDocBtn}>View</a>
                </div>
              ))}
            </div>
          )}

          {/* VISITOR REQUEST TAB */}
          {activeTab === 'visitor' && (
            <>
              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>👥 Register a Visitor</span>
                </div>
                <div style={S.cardBody}>
                  <div style={S.formGrid}>
                    <div style={S.formGroup}>
                      <label style={S.label}>Visitor Name *</label>
                      <input style={S.input} placeholder="Full name" value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Organization</label>
                      <input style={S.input} placeholder="Company/Institution" value={newVisitor.organization} onChange={e => setNewVisitor({ ...newVisitor, organization: e.target.value })} />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Visit Date *</label>
                      <input style={S.input} type="date" min="2000-01-01" max="2099-12-31" value={newVisitor.visit_date} onChange={e => setNewVisitor({ ...newVisitor, visit_date: e.target.value })} />
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Visit Time</label>
                      <input style={S.input} type="time" value={newVisitor.visit_time} onChange={e => setNewVisitor({ ...newVisitor, visit_time: e.target.value })} />
                    </div>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Purpose of Visit *</label>
                    <textarea style={{ ...S.input, height: '60px', resize: 'vertical' }} placeholder="Why is this visitor coming?" value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} />
                  </div>
                  <button style={S.saveBtn} onClick={handleSubmitVisitor}>Submit Visitor Request</button>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.cardHead}>
                  <span style={S.cardTitle}>📌 Visitors I've Invited</span>
                </div>
                {myVisitors.length === 0 ? (
                  <div style={S.empty}>You haven't invited any visitors yet</div>
                ) : myVisitors.map((v, i) => (
                  <div key={i} style={S.reqItemFull}>
                    <div style={S.reqTopFull}>
                      <div style={S.reqPurpose}>{v.name} — {v.organization || 'No org'}</div>
                      <span style={{ ...S.tag, background: stBg[v.approval_status] || '#F1F5F9', color: stColor[v.approval_status] || '#64748B' }}>{v.approval_status || 'Pending'}</span>
                    </div>
                    <div style={S.reqMeta}>
                      <span style={S.reqDate}>📅 {v.visit_date ? new Date(v.visit_date).toLocaleDateString() : 'No date'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === 'announcements' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>📢 Announcements</span>
              </div>
              {announcements.length === 0 ? (
                <div style={S.empty}>No announcements yet</div>
              ) : announcements.map((a, i) => (
                <div key={i} style={{ padding: '14px 16px', borderBottom: '1px solid #F8FAFC' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '5px' }}>{a.title}</div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>{a.content}</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '6px' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>⚙️ Settings</span>
              </div>
              <div style={S.cardBody}>
                <div style={S.avatarSection}>
                  <div style={S.bigAvatar}>{initials}</div>
                  <div>
                    <div style={S.avatarName}>{name}</div>
                    <div style={S.avatarRole}>{role} — Director's Office</div>
                  </div>
                </div>

                <div style={S.noteBox}>
                  ℹ️ Profile details can only be changed by the Administrator (Secretary).
                </div>

                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '12px' }}>🔒 Change Password</div>
                  <div style={S.formGroup}>
                    <label style={S.label}>New Password</label>
                    <input style={S.input} type="password" placeholder="Enter new password"
                      value={staffPass.newPass}
                      onChange={e => setStaffPass({ ...staffPass, newPass: e.target.value })}
                    />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Confirm Password</label>
                    <input style={S.input} type="password" placeholder="Re-enter new password"
                      value={staffPass.confirm}
                      onChange={e => setStaffPass({ ...staffPass, confirm: e.target.value })}
                    />
                  </div>
                  <button style={S.saveBtn} onClick={handleChangePassword}>Update Password</button>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                  <button style={S.btnLogout} onClick={handleLogout}>🚪 Logout</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F5F7FA', overflow:'hidden' },

  // SIDEBAR — matches SecretaryDashboard
  sidebar:      { width:'200px', background:'#fff', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', borderRight:'1px solid #E2E8F0', boxShadow:'1px 0 4px rgba(0,0,0,0.06)' },
  logoWrap:     { padding:'14px 16px 12px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'center' },
  logo:         { width:'130px', objectFit:'contain' },
  portalBanner: { padding:'14px 16px' },
  portalName:   { color:'#1A3A6B', fontSize:'13px', fontWeight:'700', lineHeight:1.4, marginBottom:'6px' },
  portalDate:   { color:'#64748B', fontSize:'11px', fontWeight:'500' },
  divider:      { height:'1px', background:'#E2E8F0', margin:'4px 0' },
  navItem:      { padding:'10px 16px', cursor:'pointer', fontSize:'12px', color:'#475569', fontWeight:'500', borderLeft:'3px solid transparent', transition:'all 0.2s ease', userSelect:'none', display:'flex', alignItems:'center' },
  navActive:    { background:'#EFF6FF', color:'#1A3A6B', borderLeft:'3px solid #2563EB', fontWeight:'700' },
  navIcon:      { fontSize:'14px', marginRight:'8px', flexShrink:0 },

  // MAIN
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },

  // TOPBAR — matches SecretaryDashboard
  topbar:          { background:'#fff', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser:      { display:'flex', alignItems:'center', gap:'10px' },
  topbarAvatar:    { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0 },
  topbarUserName:  { color:'#1A3A6B', fontSize:'13px', fontWeight:'700', lineHeight:1.2 },
  topbarUserEmail: { color:'#94A3B8', fontSize:'9px', marginTop:'1px' },
  topbarUserRole:  { color:'#64748B', fontSize:'10px', marginTop:'1px' },
  topbarRight:     { display:'flex', alignItems:'center', gap:'8px' },
  notifWrap:       { position:'relative', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:'6px', padding:'6px 10px', color:'#1A3A6B', fontSize:'14px', cursor:'pointer' },
  notifBadge:      { position:'absolute', top:'-5px', right:'-5px', background:'#EF4444', color:'#fff', borderRadius:'50%', width:'14px', height:'14px', fontSize:'8px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' },
  btnLogout:       { background:'#DC2626', color:'#fff', border:'none', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },

  // CONTENT
  content:  { flex:1, overflowY:'auto', padding:'16px 20px' },
  greeting: { fontSize:'13px', color:'#475569', marginBottom:'14px', fontWeight:'500' },

  // STATS
  statGrid:  { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' },
  statCard:  { background:'#fff', borderRadius:'10px', padding:'14px', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  statIcon:  { width:'40px', height:'40px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 },
  statNum:   { fontSize:'20px', fontWeight:'700', color:'#1E293B', lineHeight:1 },
  statLabel: { fontSize:'10px', color:'#64748B', marginTop:'2px', fontWeight:'500' },

  // QUICK ACTIONS
  quickActions: { display:'flex', gap:'12px', marginBottom:'16px' },
  actionBtn:    { flex:1, background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },

  // CARDS
  card:      { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'14px' },
  cardHead:  { padding:'12px 14px 10px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle: { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  cardBody:  { padding:'16px' },
  viewAll:   { fontSize:'10px', color:'#2563EB', fontWeight:'600', cursor:'pointer' },
  empty:     { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },

  // REQUESTS LIST
  reqItemFull: { padding:'12px 16px', borderBottom:'1px solid #F8FAFC' },
  reqTopFull:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' },
  reqPurpose:  { fontSize:'12px', fontWeight:'600', color:'#1E293B', flex:1, marginRight:'10px' },
  reqMeta:     { display:'flex', gap:'8px', alignItems:'center' },
  reqDate:     { fontSize:'10px', color:'#94A3B8' },
  tag:         { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },

  // EVENTS / DOCS LIST
  eventItem:   { display:'flex', alignItems:'center', gap:'12px', padding:'10px 16px', borderBottom:'1px solid #F8FAFC' },
  eventTime:   { fontSize:'10px', color:'#2563EB', fontWeight:'600', width:'140px', flexShrink:0 },
  eventTitle:  { fontSize:'11px', fontWeight:'600', color:'#1E293B', flex:1 },
  viewDocBtn:  { fontSize:'10px', color:'#2563EB', fontWeight:'700', textDecoration:'none', background:'#EFF6FF', padding:'5px 12px', borderRadius:'6px' },

  // FORMS
  formGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' },
  formGroup: { display:'flex', flexDirection:'column', marginBottom:'14px' },
  label:     { fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:     { border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', width:'100%' },
  noteBox:   { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#1E40AF', marginBottom:'16px', lineHeight:1.5, margin:'16px' },
  saveBtn:   { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px 24px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },

  // SETTINGS
  avatarSection: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid #F1F5F9' },
  bigAvatar:     { width:'50px', height:'50px', borderRadius:'50%', background:'linear-gradient(135deg,#1A3A6B,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', color:'#fff', flexShrink:0 },
  avatarName:    { fontSize:'14px', fontWeight:'700', color:'#1E293B', marginBottom:'3px' },
  avatarRole:    { fontSize:'11px', color:'#64748B' },
};

export default StaffPortal;