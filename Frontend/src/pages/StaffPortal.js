import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function StaffPortal() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [myRequests, setMyRequests] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [newRequest, setNewRequest] = useState({ purpose: '', priority: 'Low', preferred_date: '', preferred_time: '', requester_name: '', department: '' });
  const [newVisitor, setNewVisitor] = useState({ name: '', organization: '', purpose: '', visit_date: '', visit_time: '' });
  const [staffPass, setStaffPass] = useState({ newPass: '', confirm: '' });

  const name = localStorage.getItem('name') || 'User';
  const role = localStorage.getItem('role') || 'Staff';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, evRes, notifRes, announcRes] = await Promise.all([
        API.get('/meetings/my'),
        API.get('/events/public'),
        API.get('/user/notifications'),
        API.get('/user/announcements')
      ]);
      if (reqRes.data.success) setMyRequests(reqRes.data.data);
      if (evRes.data.success) setPublicEvents(evRes.data.data);
      if (notifRes.data.success) setNotifications(notifRes.data.data);
      if (announcRes.data.success) setAnnouncements(announcRes.data.data);
    } catch (err) {
      console.log('Error fetching staff data:', err);
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
        setShowRequestForm(false);
        setNewRequest({ purpose: '', priority: 'Low', preferred_date: '', preferred_time: '', requester_name: '', department: '' });
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
      const res = await API.post('/visitors/request', newVisitor);
      if (res.data.success) {
        alert('Visitor request submitted!');
        setShowVisitorForm(false);
        setNewVisitor({ name: '', organization: '', purpose: '', visit_date: '', visit_time: '' });
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
        email: localStorage.getItem('email'),
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
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'request', label: 'Request Meeting' },
          { key: 'myrequests', label: 'My Requests' },
          { key: 'calendar', label: 'Calendar' },
          { key: 'visitor', label: 'Visitor Request' },
          { key: 'settings', label: 'Settings' },
        ].map((item, i) => (
          <div key={i}
            style={{ ...styles.navItem, ...(item.path === window.location.pathname ? styles.navActive : {}) }}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </div>
        ))}

        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>{initials}</div>
          <div style={{ flex: 1 }}>
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
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔 {notifications.filter(n => !n.read_status).length > 0 ? `(${notifications.filter(n => !n.read_status).length})` : ''}</div>
            <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div style={styles.content}>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              <div style={styles.greeting}>
                Welcome, <span style={{ color: '#2563EB', fontWeight: '700' }}>{name}</span> 👋
              </div>

              <div style={styles.statGrid}>
                {[
                  { icon: '📋', label: 'My Requests', value: myRequests.length, bg: '#EFF6FF', color: '#1A3A6B' },
                  { icon: '⏳', label: 'Pending', value: myRequests.filter(r => r.status === 'Pending').length, bg: '#FEF3C7', color: '#92400E' },
                  { icon: '✅', label: 'Approved', value: myRequests.filter(r => r.status === 'Approved').length, bg: '#DCFCE7', color: '#166534' },
                  { icon: '🔔', label: 'Notifications', value: notifications.filter(n => !n.read_status).length, bg: '#EDE9FE', color: '#5B21B6' },
                ].map((s, i) => (
                  <div key={i} style={{ ...styles.statCard, background: s.bg }}>
                    <div style={styles.statIcon}>{s.icon}</div>
                    <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>


              {/* QUICK ACTIONS */}
              <div style={styles.quickActions}>
                <button style={styles.actionBtn} onClick={() => setActiveTab('request')}>
                  📋 Request Meeting with Director
                </button>
                <button style={{ ...styles.actionBtn, background: '#0EA5E9' }} onClick={() => setActiveTab('visitor')}>
                  👥 Register a Visitor
                </button>
                <button style={{ ...styles.actionBtn, background: '#7C3AED' }} onClick={() => setActiveTab('myrequests')}>
                  📌 View My Requests
                </button>
              </div>

              {/* NOTIFICATIONS */}
              {notifications.filter(n => !n.read_status).length > 0 && (
                <div style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardTitle}>🔔 New Notifications</span>
                  </div>
                  {notifications.filter(n => !n.read_status).map((n, i) => (
                    <div key={i} style={styles.notifItem}>
                      <span style={styles.notifMsg}>{n.message}</span>
                      <span style={styles.notifTime}>{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ANNOUNCEMENTS */}
          {announcements.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📢 Announcements</span>
              </div>
              {announcements.map((a, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: '2px solid #F8FAFC' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>{a.title}</div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>{a.content}</div>
                  <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '4px' }}>{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* REQUEST MEETING TAB */}
          {activeTab === 'request' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📋 Request Meeting with Director</span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Your Name *</label>
                    <input style={styles.input} placeholder="Full name"
                      value={newRequest.requester_name || ''}
                      onChange={e => setNewRequest({ ...newRequest, requester_name: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Department *</label>
                    <input style={styles.input} placeholder="e.g. Computer Science"
                      value={newRequest.department || ''}
                      onChange={e => setNewRequest({ ...newRequest, department: e.target.value })}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Purpose of Meeting *</label>
                  <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                    placeholder="Describe the purpose of your meeting request..."
                    value={newRequest.purpose}
                    onChange={e => setNewRequest({ ...newRequest, purpose: e.target.value })}
                  />
                </div>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Priority</label>
                    <select style={styles.input} value={newRequest.priority} onChange={e => setNewRequest({ ...newRequest, priority: e.target.value })}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Preferred Date</label>
                    <input style={styles.input} type="date" value={newRequest.preferred_date} onChange={e => setNewRequest({ ...newRequest, preferred_date: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Preferred Time</label>
                    <input style={styles.input} type="time" value={newRequest.preferred_time} onChange={e => setNewRequest({ ...newRequest, preferred_time: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Attach Document (optional)</label>
                    <input style={styles.input} type="file" onChange={e => setNewRequest({ ...newRequest, attachment: e.target.files[0] })} />
                  </div>
                </div>
                <div style={styles.noteBox}>
                  ℹ️ Your request will be reviewed by the Secretary and approved by the Director. You will be notified once a decision is made.
                </div>
                <button style={styles.saveBtn} onClick={handleSubmitRequest}>Submit Request</button>
              </div>
            </div>
          )}

          {/* MY REQUESTS TAB */}
          {activeTab === 'myrequests' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📌 My Meeting Requests</span>
              </div>
              {myRequests.length === 0 ? (
                <div style={styles.emptyMsg}>You haven't submitted any requests yet</div>
              ) : myRequests.map((req, i) => (
                <div key={i} style={styles.reqItem}>
                  <div style={styles.reqTop}>
                    <div style={styles.reqPurpose}>{req.purpose}</div>
                    <span style={{ ...styles.badge2, background: stBg[req.status], color: stColor[req.status] }}>{req.status}</span>
                  </div>
                  <div style={styles.reqMeta}>
                    <span style={{ ...styles.badge2, background: priBg[req.priority], color: priColor[req.priority] }}>{req.priority}</span>
                    <span style={styles.reqDate}>📅 {req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : 'No date'}</span>
                    <span style={styles.reqDate}>🕐 {req.preferred_time || 'No time'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📅 Public Events & Schedule</span>
              </div>
              {publicEvents.length === 0 ? (
                <div style={styles.emptyMsg}>No public events available</div>
              ) : publicEvents.map((ev, i) => (
                <div key={i} style={styles.eventItem}>
                  <div style={styles.eventTime}>
                    {new Date(ev.start_time).toLocaleDateString()} {new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                  <div style={styles.eventTitle}>{ev.title}</div>
                  <span style={{ ...styles.badge2, background: '#DBEAFE', color: '#1E40AF' }}>{ev.type}</span>
                </div>
              ))}
            </div>
          )}

          {/* VISITOR REQUEST TAB */}
          {activeTab === 'visitor' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>👥 Register a Visitor</span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Visitor Name *</label>
                    <input style={styles.input} placeholder="Full name" value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Organization</label>
                    <input style={styles.input} placeholder="Company/Institution" value={newVisitor.organization} onChange={e => setNewVisitor({ ...newVisitor, organization: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Visit Date *</label>
                    <input style={styles.input} type="date" value={newVisitor.visit_date} onChange={e => setNewVisitor({ ...newVisitor, visit_date: e.target.value })} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Visit Time</label>
                    <input style={styles.input} type="time" value={newVisitor.visit_time} onChange={e => setNewVisitor({ ...newVisitor, visit_time: e.target.value })} />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Purpose of Visit *</label>
                  <textarea style={{ ...styles.input, height: '60px', resize: 'vertical' }} placeholder="Why is this visitor coming?" value={newVisitor.purpose} onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })} />
                </div>
                <button style={styles.saveBtn} onClick={handleSubmitVisitor}>Submit Visitor Request</button>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>⚙️ Settings</span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.avatarSection}>
                  <div style={styles.bigAvatar}>{initials}</div>
                  <div>
                    <div style={styles.avatarName}>{name}</div>
                    <div style={styles.avatarRole}>{role} — Director's Office</div>
                  </div>
                </div>

                <div style={styles.noteBox}>
                  ℹ️ Profile details can only be changed by the Administrator.
                </div>

                {/* CHANGE PASSWORD */}
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '12px' }}>🔒 Change Password</div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <input style={styles.input} type="password" placeholder="Enter new password"
                      value={staffPass.newPass}
                      onChange={e => setStaffPass({ ...staffPass, newPass: e.target.value })}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input style={styles.input} type="password" placeholder="Re-enter new password"
                      value={staffPass.confirm}
                      onChange={e => setStaffPass({ ...staffPass, confirm: e.target.value })}
                    />
                  </div>
                  <button style={styles.saveBtn} onClick={handleChangePassword}>Update Password</button>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                  <button style={{ ...styles.saveBtn, background: '#EF4444' }} onClick={handleLogout}>
                    🚪 Logout
                  </button>
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
  sidebar: { width: '180px', background: '#122951', display: 'flex', flexDirection: 'column', flexShrink: 0 },
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
  topbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  notifBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '14px', cursor: 'pointer' },
  logoutBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#FCA5A5', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  content: { flex: 1, overflowY: 'auto', padding: '18px 22px' },
  greeting: { fontSize: '14px', color: '#475569', marginBottom: '16px' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' },
  statCard: { borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' },
  statIcon: { fontSize: '22px' },
  statNum: { fontSize: '22px', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '10px', color: '#64748B', fontWeight: '500' },
  quickActions: { display: 'flex', gap: '12px', marginBottom: '16px' },
  actionBtn: { flex: 1, background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  card: { background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '14px' },
  cardHeader: { padding: '13px 16px 10px', borderBottom: '1px solid #F1F5F9' },
  cardTitle: { fontSize: '12px', fontWeight: '700', color: '#1E293B' },
  cardBody: { padding: '16px' },
  notifItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #F8FAFC' },
  notifMsg: { fontSize: '11px', color: '#1E293B', fontWeight: '500' },
  notifTime: { fontSize: '10px', color: '#94A3B8' },
  reqItem: { padding: '12px 16px', borderBottom: '1px solid #F8FAFC' },
  reqTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  reqPurpose: { fontSize: '12px', fontWeight: '600', color: '#1E293B', flex: 1, marginRight: '10px' },
  reqMeta: { display: 'flex', gap: '8px', alignItems: 'center' },
  reqDate: { fontSize: '10px', color: '#94A3B8' },
  badge2: { fontSize: '9px', fontWeight: '700', padding: '3px 9px', borderRadius: '10px', flexShrink: 0 },
  eventItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: '1px solid #F8FAFC' },
  eventTime: { fontSize: '10px', color: '#2563EB', fontWeight: '600', width: '140px', flexShrink: 0 },
  eventTitle: { fontSize: '11px', fontWeight: '600', color: '#1E293B', flex: 1 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '14px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px' },
  input: { border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 13px', fontSize: '12px', color: '#1E293B', outline: 'none', boxSizing: 'border-box', width: '100%' },
  noteBox: { background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '10px 13px', fontSize: '10px', color: '#1E40AF', marginBottom: '16px', lineHeight: 1.5 },
  saveBtn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  emptyMsg: { padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' },
  avatarSection: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' },
  bigAvatar: { width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg,#1A3A6B,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#1E293B', marginBottom: '3px' },
  avatarRole: { fontSize: '11px', color: '#64748B' },
  logoutTopBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#FCA5A5', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  lnmiitLogo: { width: '90px', objectFit: 'contain', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '4px' },
  topbarLogo: { height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '3px' },
  topbarSub: { color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '1px' },
};

export default StaffPortal;