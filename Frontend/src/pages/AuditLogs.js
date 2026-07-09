import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import { useNotifCount } from '../hooks/useNotifCount';

function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [hoveredNav, setHoveredNav] = useState(null);

  const role     = localStorage.getItem('role');
  const name     = localStorage.getItem('name') || 'User';
  const email    = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today    = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const { count: notifCount } = useNotifCount();

  const navItems = [
    { label:'Dashboard',     icon:'🏠', path: role === 'Director' ? '/director-dashboard' : '/dashboard' },
    { label:'Calendar',      icon:'📅', path:'/calendar' },
    { label:'Requests',      icon:'📋', path:'/requests' },
    { label:'Documents',     icon:'📁', path:'/documents' },
    { label:'Visitors',      icon:'👥', path:'/visitors' },
    { label:'Communication', icon:'📬', path:'/communications' },
    { label:'Tasks',         icon:'✅', path:'/tasks' },
    { label:'Announcements', icon:'📢', path:'/announcements' },
    { label:'Reports',       icon:'📊', path:'/reports' },
    { label:'Audit Logs',    icon:'🕵️', path:'/audit-logs' },
    { label:'Settings',      icon:'⚙️', path:'/settings' },
  ];

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/user/audit-logs');
      if (res.data.success) setLogs(res.data.data);
    } catch (err) {
      console.log('Audit log fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const modules = ['all', 'Auth', 'Requests', 'Calendar', 'Tasks', 'Documents', 'Visitors'];

  const filtered = logs
    .filter(l => filterModule === 'all' || l.module === filterModule)
    .filter(l =>
      !search ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.module || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.user_id || '').toLowerCase().includes(search.toLowerCase())
    );

  const todayStr = new Date().toISOString().split('T')[0];

  const actionBg = {
    'APPROVED visitor':    '#DCFCE7', 'REJECTED visitor':    '#FEE2E2',
    'RESCHEDULED visitor': '#DBEAFE', 'APPROVED request':    '#DCFCE7',
    'REJECTED request':    '#FEE2E2', 'RESCHEDULED request': '#DBEAFE',
    'UPLOADED document':   '#EDE9FE', 'DELETED document':    '#FEE2E2',
    'LOGIN':               '#F0FDF4',
  };
  const actionColor = {
    'APPROVED visitor':    '#166534', 'REJECTED visitor':    '#991B1B',
    'RESCHEDULED visitor': '#1E40AF', 'APPROVED request':    '#166534',
    'REJECTED request':    '#991B1B', 'RESCHEDULED request': '#1E40AF',
    'UPLOADED document':   '#5B21B6', 'DELETED document':    '#991B1B',
    'LOGIN':               '#166534',
  };

  const getActionStyle = (action) => {
    const a = (action || '').toUpperCase();
    if (a.includes('APPROVED'))    return { bg:'#DCFCE7', color:'#166534' };
    if (a.includes('REJECTED'))    return { bg:'#FEE2E2', color:'#991B1B' };
    if (a.includes('RESCHEDULED')) return { bg:'#DBEAFE', color:'#1E40AF' };
    if (a.includes('UPLOADED'))    return { bg:'#EDE9FE', color:'#5B21B6' };
    if (a.includes('DELETED'))     return { bg:'#FEE2E2', color:'#991B1B' };
    if (a.includes('LOGIN'))       return { bg:'#F0FDF4', color:'#166534' };
    if (a.includes('CREATED'))     return { bg:'#DBEAFE', color:'#1E40AF' };
    return { bg:'#F1F5F9', color:'#64748B' };
  };

  const getModuleStyle = (mod) => {
    const m = (mod || '');
    if (m === 'Visitors')  return { bg:'#EDE9FE', color:'#5B21B6' };
    if (m === 'Requests')  return { bg:'#FEF3C7', color:'#92400E' };
    if (m === 'Calendar')  return { bg:'#DBEAFE', color:'#1E40AF' };
    if (m === 'Documents') return { bg:'#DCFCE7', color:'#166534' };
    if (m === 'Tasks')     return { bg:'#FEE2E2', color:'#991B1B' };
    if (m === 'Auth')      return { bg:'#F0FDF4', color:'#166534' };
    return { bg:'#EFF6FF', color:'#1A3A6B' };
  };

  const formatTimestamp = (ts) => {
    if (!ts) return { date: '—', time: '—' };
    const d = new Date(ts);
    if (isNaN(d)) return { date: ts, time: '' };
    return {
      date: d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true }),
    };
  };

  return (
    <div style={S.page} className="page-transition">

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
            <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button>
            <button style={S.btnLogout} onClick={() => { localStorage.clear(); navigate('/'); }}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>🕵️ Audit Logs</div>
              <div style={S.pageSub}>Track all actions performed in the portal</div>
            </div>
            <button style={S.refreshBtn} onClick={fetchLogs}>↻ Refresh</button>
          </div>

          {/* STAT CARDS */}
          <div style={S.statGrid}>
            {[
              { label:'Total Actions', num: logs.length,                                                                    bg:'#EFF6FF', color:'#1A3A6B' },
              { label:'Today',         num: logs.filter(l => (l.timestamp||'').startsWith(todayStr)).length,                bg:'#DBEAFE', color:'#1E40AF' },
              { label:'Approvals',     num: logs.filter(l => (l.action||'').toUpperCase().includes('APPROVED')).length,     bg:'#DCFCE7', color:'#166534' },
              { label:'Rejections',    num: logs.filter(l => (l.action||'').toUpperCase().includes('REJECTED')).length,     bg:'#FEE2E2', color:'#991B1B' },
            ].map((s, i) => (
              <div key={i} style={{ ...S.statCard, background:s.bg }}>
                <div style={{ ...S.statNum, color:s.color }}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* SEARCH + MODULE FILTER */}
          <div style={{ marginBottom:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
            <input
              style={S.searchInput}
              type="text"
              placeholder="🔍  Search by action, module..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={S.tabs}>
              {modules.map(mod => (
                <div key={mod}
                  style={{ ...S.tab, ...(filterModule === mod ? S.tabActive : {}) }}
                  onClick={() => setFilterModule(mod)}
                >
                  {mod === 'all' ? 'All' : mod}
                </div>
              ))}
            </div>
          </div>

          {/* LOGS TABLE */}
          <div style={S.tableWrap}>
            <div style={S.tableHead}>
              <div style={{ ...S.th, flex:1.2 }}>Timestamp</div>
              <div style={{ ...S.th, flex:0.8 }}>Action</div>
              <div style={{ ...S.th, flex:0.8 }}>Module</div>
              <div style={{ ...S.th, flex:1.5 }}>User ID</div>
            </div>

            {loading ? (
              <div style={S.empty}>Loading audit logs...</div>
            ) : filtered.length === 0 ? (
              <div style={S.empty}>No logs found</div>
            ) : filtered.map((log, i) => {
              const { date, time } = formatTimestamp(log.timestamp);
              const actionStyle  = getActionStyle(log.action);
              const moduleStyle  = getModuleStyle(log.module);
              return (
                <div key={log.id || i} style={{ ...S.tableRow, background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <div style={{ ...S.td, flex:1.2, flexDirection:'column', alignItems:'flex-start', gap:'2px' }}>
                    <span style={{ fontSize:'11px', fontWeight:'600', color:'#1E293B', fontFamily:'monospace' }}>{time}</span>
                    <span style={{ fontSize:'9px', color:'#94A3B8', fontFamily:'monospace' }}>{date}</span>
                  </div>
                  <div style={{ ...S.td, flex:0.8 }}>
                    <span style={{ ...S.pill, background:actionStyle.bg, color:actionStyle.color }}>
                      {log.action || '—'}
                    </span>
                  </div>
                  <div style={{ ...S.td, flex:0.8 }}>
                    <span style={{ ...S.pill, background:moduleStyle.bg, color:moduleStyle.color }}>
                      {log.module || '—'}
                    </span>
                  </div>
                  <div style={{ ...S.td, flex:1.5 }}>
                    <span style={{ fontSize:'10px', color:'#475569', fontFamily:'monospace' }}>
                      {log.user_id || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER NOTE */}
          {!loading && logs.length > 0 && (
            <div style={{ fontSize:'10px', color:'#94A3B8', textAlign:'center', marginTop:'12px' }}>
              Showing {filtered.length} of {logs.length} log entries (last 100 actions)
            </div>
          )}

        </div>
      </div>
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
  portalDate:     { color:'#64748B', fontSize:'10px', fontWeight:'500' },
  divider:        { height:'1px', background:'#E2E8F0', margin:'4px 0' },
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
  refreshBtn:     { background:'#F1F5F9', color:'#1A3A6B', border:'1px solid #E2E8F0', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  statGrid:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:       { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  statNum:        { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  searchInput:    { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', background:'#fff' },
  tabs:           { display:'flex', gap:'4px', background:'#F1F5F9', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', flexWrap:'wrap' },
  tab:            { padding:'6px 14px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  tableWrap:      { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  tableHead:      { display:'flex', alignItems:'center', padding:'10px 16px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' },
  th:             { fontSize:'10px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' },
  tableRow:       { display:'flex', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid #F8FAFC' },
  td:             { display:'flex', alignItems:'center', paddingRight:'8px' },
  pill:           { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px' },
  empty:          { padding:'30px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default AuditLogs;