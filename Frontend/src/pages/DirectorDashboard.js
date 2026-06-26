import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import { useNotifCount } from '../hooks/useNotifCount';

// Animation styles (same as SecretaryDashboard)
const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
`;
if (!document.getElementById('dashboard-animations')) {
  const style = document.createElement('style');
  style.id = 'dashboard-animations';
  style.textContent = animationStyles;
  document.head.appendChild(style);
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1A3A6B';
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', background: bg, color: '#fff', padding: '12px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideDown 0.3s ease' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {message}
    </div>
  );
}

function DirectorDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Director';
  const role = localStorage.getItem('role') || 'Director';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  const [stats, setStats] = useState({ requests: 0, meetings: 0, approvedThisWeek: 0, visitors: 0 });
  const [schedule, setSchedule] = useState([]);
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [toast, setToast] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredSchItem, setHoveredSchItem] = useState(null);
  const [hoveredReqItem, setHoveredReqItem] = useState(null);
  const [hoveredBtnId, setHoveredBtnId] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const { count: notifCount } = useNotifCount();

  // Announcement panel state
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', category: 'General', priority: 'Medium' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, reqRes, visitorsRes] = await Promise.all([
  API.get('/events/full'),
  API.get('/meetings/all'),
  API.get('/visitors/today'),
]);

      if (eventsRes.data.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = eventsRes.data.data.filter(e => e.start_time.split('T')[0] === today);
        setSchedule(todayEvents.slice(0, 4));
        setStats(prev => ({ ...prev, meetings: todayEvents.length }));
      }
      if (reqRes.data.success) {
        const pending = reqRes.data.data.filter(r => r.status === 'Pending');
        setRequests(pending.slice(0, 4));
        setStats(prev => ({ ...prev, requests: pending.length }));

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const approvedRecently = reqRes.data.data.filter(r =>
          r.status === 'Approved' && r.updated_at && new Date(r.updated_at) > oneWeekAgo
        );
        setStats(prev => ({ ...prev, approvedThisWeek: approvedRecently.length }));
      }
      if (visitorsRes.data.success) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayVisitors = visitorsRes.data.data.filter(v => v.visit_date && v.visit_date.split('T')[0] === todayStr);
        setStats(prev => ({ ...prev, visitors: todayVisitors.length }));
      }
    } catch (err) { console.log('Dashboard fetch error:', err); }

    try {
      const annRes = await API.get('/announcements');
      if (annRes.data.success) setAnnouncements(annRes.data.data.slice(0, 3));
    } catch (err) { console.log(err); }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/approve`);
      if (res.data.success) { showToast('Request approved!'); fetchDashboardData(); }
      else showToast(res.data.message, 'error');
    } catch { showToast('Failed to approve', 'error'); }
  };
  const handleReject = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/reject`);
      if (res.data.success) { showToast('Request rejected', 'error'); fetchDashboardData(); }
      else showToast(res.data.message, 'error');
    } catch { showToast('Failed to reject', 'error'); }
  };

  const handlePostAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }
    try {
      const res = await API.post('/announcements', newAnnouncement);
      if (res.data.success) {
        showToast('Announcement posted!');
        setShowAnnouncement(false);
        setNewAnnouncement({ title: '', content: '', category: 'General', priority: 'Medium' });
        fetchDashboardData();
      } else {
        showToast(res.data.message || 'Failed to post', 'error');
      }
    } catch {
      showToast('Failed to post announcement', 'error');
    }
  };

  const getEventTypeStyle = (type) => {
    if (type === 'Confidential') return { tagBg: '#FEE2E2', tagColor: '#991B1B', dot: '#EF4444' };
    if (type === 'Internal') return { tagBg: '#FEF3C7', tagColor: '#92400E', dot: '#F59E0B' };
    return { tagBg: '#DBEAFE', tagColor: '#1E40AF', dot: '#2563EB' };
  };
  const getPriorityStyle = (priority) => {
    if (priority === 'High') return { priBg: '#FEE2E2', priColor: '#991B1B' };
    if (priority === 'Medium') return { priBg: '#DBEAFE', priColor: '#1E40AF' };
    return { priBg: '#DCFCE7', priColor: '#166534' };
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Minimal sidebar — only 4 tabs per sir's requirement
  const navItems = [
  { label: 'Dashboard', path: '/director-dashboard', icon: '🏠' },
  { label: 'Requests', path: '/requests', icon: '📋' },
  { label: 'Calendar', path: '/calendar', icon: '📅' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

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
            style={{ ...S.navItem, ...(item.path === window.location.pathname ? S.navActive : {}), ...(hoveredNav === i && item.path !== window.location.pathname ? { background: '#F8FAFC', color: '#1A3A6B' } : {}) }}
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
            <button
              style={{ ...S.btnAnnounce, ...(hoveredBtn === 'announce' ? S.btnAnnounceHover : {}) }}
              onMouseEnter={() => setHoveredBtn('announce')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={() => setShowAnnouncement(!showAnnouncement)}
            >
              📢 Announcement
            </button>
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>
              🔔 {notifCount > 0 && <span style={S.notifBadge}>{notifCount}</span>}
            </div>
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        {/* ANNOUNCEMENT PANEL */}
        {showAnnouncement && (
          <div style={S.panel}>
            <div style={S.panelForm}>
              <input
                style={{ ...S.pInput, flex: 2 }}
                placeholder="Announcement title *"
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
              <select
                style={{ ...S.pInput, flex: 1 }}
                value={newAnnouncement.category}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}
              >
                <option>General</option>
                <option>Academic</option>
                <option>Meeting</option>
                <option>Research</option>
                <option>Holiday</option>
              </select>
              <select
                style={{ ...S.pInput, flex: 1 }}
                value={newAnnouncement.priority}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input
                style={{ ...S.pInput, flex: 3 }}
                placeholder="Content *"
                value={newAnnouncement.content}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
              <button style={S.pBtn} onClick={handlePostAnnouncement}>Post</button>
              <button style={S.pBtnCancel} onClick={() => setShowAnnouncement(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* CONTENT */}
        <div style={S.content}>

          {/* GREETING */}
          <div style={S.greeting}>
            {getGreeting()}, <span style={{ color: '#2563EB', fontWeight: '700' }}>{name}</span> &nbsp;|&nbsp; Here's your office overview for today.
          </div>

          {/* STAT CARDS */}
          <div style={S.statGrid}>
            {[
              { icon: '✉️', num: stats.requests, label: 'Pending Approvals', bg: '#FEE2E2', path: '/requests' },
              { icon: '📅', num: stats.meetings, label: "Today's Meetings", bg: '#EFF6FF', path: '/calendar' },
              { icon: '✓', num: stats.approvedThisWeek, label: 'Approved This Week', bg: '#DCFCE7', path: '/requests' },
              { icon: '👥', num: stats.visitors, label: "Today's Visitors", bg: '#F0FDF4', path: '/calendar' },
            ].map((s, i) => (
              <div key={i}
                style={{ ...S.statCard, ...(hoveredStat === i ? { boxShadow: '0 4px 12px rgba(37,99,235,0.15)', transform: 'translateY(-1px)' } : {}) }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => navigate(s.path)}
              >
                <div style={{ ...S.statIcon, background: s.bg }}>{s.icon}</div>
                <div>
                  <div style={S.statNum}>{s.num}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* THREE COLUMNS */}
          <div style={S.threeCol}>

            {/* PENDING APPROVALS — Director has final approval authority per SRS */}
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>📋 Pending Approvals</span>
                <span style={S.viewAll} onClick={() => navigate('/requests')}>View all →</span>
              </div>
              {requests.length === 0 ? <div style={S.empty}>No pending approvals</div> : requests.map((r, i) => {
                const st = getPriorityStyle(r.priority);
                return (
                  <div key={i}
                    style={{ ...S.reqItem, ...(hoveredReqItem === i ? { background: '#F8FAFC', paddingLeft: '16px' } : {}) }}
                    onMouseEnter={() => setHoveredReqItem(i)}
                    onMouseLeave={() => setHoveredReqItem(null)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={S.reqId}>#{r.id.slice(0, 8)}</div>
                      <div style={S.reqName}>{r.purpose ? r.purpose.slice(0, 25) + '...' : 'No purpose'}</div>
                      <span style={{ ...S.tag, background: st.priBg, color: st.priColor }}>{r.priority}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        style={{ ...S.approveBtn, ...(hoveredBtnId === `approve-${r.id}` ? { boxShadow: '0 2px 8px rgba(34,197,94,0.3)', transform: 'scale(1.05)' } : {}) }}
                        onMouseEnter={() => setHoveredBtnId(`approve-${r.id}`)}
                        onMouseLeave={() => setHoveredBtnId(null)}
                        onClick={() => handleApprove(r.id)}
                      >✓</button>
                      <button
                        style={{ ...S.rejectBtn, ...(hoveredBtnId === `reject-${r.id}` ? { boxShadow: '0 2px 8px rgba(239,68,68,0.3)', transform: 'scale(1.05)' } : {}) }}
                        onMouseEnter={() => setHoveredBtnId(`reject-${r.id}`)}
                        onMouseLeave={() => setHoveredBtnId(null)}
                        onClick={() => handleReject(r.id)}
                      >✕</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TODAY'S SCHEDULE — full details visible per SRS (Director sees everything) */}
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={S.cardTitle}>📅 Today's Schedule</span>
                <span style={S.viewAll} onClick={() => navigate('/calendar')}>View all →</span>
              </div>
              {schedule.length === 0 ? <div style={S.empty}>No events today</div> : schedule.map((ev, i) => {
                const st = getEventTypeStyle(ev.type);
                const time = ev.start_time.includes('T') ? ev.start_time.split('T')[1].slice(0, 5) : ev.start_time.split(' ')[1]?.slice(0, 5);
                return (
                  <div key={i}
                    style={{ ...S.schItem, ...(hoveredSchItem === i ? { background: '#F8FAFC' } : {}) }}
                    onMouseEnter={() => setHoveredSchItem(i)}
                    onMouseLeave={() => setHoveredSchItem(null)}
                  >
                    <span style={S.schTime}>{time}</span>
                    <div style={{ ...S.dot, background: st.dot }} />
                    <div style={{ flex: 1 }}>
                      <div style={S.schTitle}>{ev.title}</div>
                      <span style={{ ...S.tag, background: st.tagBg, color: st.tagColor }}>{ev.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RECENT ANNOUNCEMENTS */}
          <div style={S.card}>
            <div style={S.cardHead}>
              <span style={S.cardTitle}>📢 Recent Announcements</span>
            </div>
            {announcements.length === 0 ? <div style={S.empty}>No announcements</div> : announcements.map((a, i) => (
              <div key={i} style={{ padding: '10px 14px', borderBottom: '1px solid #F8FAFC' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', marginBottom: '3px' }}>{a.title}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{a.content}</div>
                <div style={{ fontSize: '9px', color: '#94A3B8', marginTop: '4px' }}>{new Date(a.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#F5F7FA', overflow: 'hidden' },
  sidebar: { width: '200px', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', borderRight: '1px solid #E2E8F0', boxShadow: '1px 0 4px rgba(0,0,0,0.06)' },
  logoWrap: { padding: '14px 16px 12px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' },
  logo: { width: '130px', objectFit: 'contain' },
  portalBanner: { padding: '14px 16px' },
  portalName: { color: '#1A3A6B', fontSize: '13px', fontWeight: '700', lineHeight: 1.4, marginBottom: '6px' },
  portalDate: { color: '#64748B', fontSize: '11px', fontWeight: '500' },
  divider: { height: '1px', background: '#E2E8F0', margin: '4px 0' },
  navItem: { padding: '10px 16px', cursor: 'pointer', fontSize: '12px', color: '#475569', fontWeight: '500', borderLeft: '3px solid transparent', transition: 'all 0.2s ease', userSelect: 'none', display: 'flex', alignItems: 'center' },
  navActive: { background: '#EFF6FF', color: '#1A3A6B', borderLeft: '3px solid #2563EB', fontWeight: '700' },
  navIcon: { fontSize: '14px', marginRight: '8px', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#fff', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser: { display: 'flex', alignItems: 'center', gap: '10px' },
  topbarAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  topbarUserName: { color: '#1A3A6B', fontSize: '13px', fontWeight: '700', lineHeight: 1.2 },
  topbarUserEmail: { color: '#94A3B8', fontSize: '9px', marginTop: '1px' },
  topbarUserRole: { color: '#64748B', fontSize: '10px', marginTop: '1px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  btnAnnounce: { background: 'transparent', color: '#7C3AED', border: '1px solid #7C3AED', borderRadius: '4px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' },
  btnAnnounceHover: { background: '#7C3AED', color: '#fff' },
  notifWrap: { position: 'relative', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', color: '#1A3A6B', fontSize: '14px', cursor: 'pointer' },
  notifBadge: { position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', fontSize: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnLogout: { background: '#DC2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  panel: { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '12px 22px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  panelForm: { display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' },
  pInput: { border: '1px solid #E2E8F0', borderRadius: '4px', padding: '8px 12px', fontSize: '12px', outline: 'none', flex: 1, fontFamily: "'DM Sans',sans-serif", minWidth: '120px' },
  pBtn: { background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 18px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' },
  pBtnCancel: { background: '#64748B', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 18px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 },
  content: { flex: 1, overflowY: 'auto', padding: '16px 20px', animation: 'fadeIn 0.3s ease' },
  greeting: { fontSize: '13px', color: '#475569', marginBottom: '14px', fontWeight: '500' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '14px' },
  statIcon: { width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  statNum: { fontSize: '20px', fontWeight: '700', color: '#1E293B', lineHeight: 1 },
  statLabel: { fontSize: '10px', color: '#64748B', marginTop: '2px', fontWeight: '500' },
  statCard: { background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s ease, transform 0.2s ease', cursor: 'pointer' },
  threeCol: { display: 'grid', gridTemplateColumns: '1fr 1fr ', gap: '12px', marginBottom: '12px' },
  card: { background: '#fff', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '12px', transition: 'all 0.2s ease' },
  cardHead: { padding: '12px 14px 10px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: '12px', fontWeight: '700', color: '#1E293B' },
  viewAll: { fontSize: '10px', color: '#2563EB', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  empty: { padding: '16px', fontSize: '11px', color: '#94A3B8', textAlign: 'center' },
  schItem: { display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 16px', borderBottom: '1px solid #F8FAFC', transition: 'background 0.2s ease', cursor: 'pointer' },
  schTime: { fontSize: '10px', color: '#94A3B8', width: '34px', flexShrink: 0, fontFamily: 'monospace', marginTop: '2px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0, marginTop: '4px' },
  schTitle: { fontSize: '11px', fontWeight: '600', color: '#1E293B', marginBottom: '3px' },
  tag: { fontSize: '8px', fontWeight: '600', padding: '2px 7px', borderRadius: '10px' },
  reqItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #F8FAFC', transition: 'all 0.2s ease' },
  reqId: { fontSize: '9px', color: '#94A3B8', marginBottom: '2px' },
  reqName: { fontSize: '11px', fontWeight: '600', color: '#1E293B', marginBottom: '3px' },
  approveBtn: { background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '5px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' },
  rejectBtn: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '5px', padding: '4px 8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' },
};

export default DirectorDashboard;