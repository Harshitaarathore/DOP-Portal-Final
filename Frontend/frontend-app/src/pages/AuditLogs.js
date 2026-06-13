import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get('/audit-logs');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      // fallback dummy data
      setLogs([
        { id:1,  user:'director@lnmiit.ac.in',   role:'Director',   action:'Approved',  module:'Requests',  details:'Approved meeting request from Dr. Sharma',          timestamp:'2026-05-31 09:15:00' },
        { id:2,  user:'ps.director@lnmiit.ac.in', role:'Secretary',  action:'Created',   module:'Calendar',  details:'Created event: NAAC Committee Review',               timestamp:'2026-05-31 09:10:00' },
        { id:3,  user:'director@lnmiit.ac.in',   role:'Director',   action:'Rejected',  module:'Requests',  details:'Rejected leave request from Prof. Mehta',            timestamp:'2026-05-31 08:55:00' },
        { id:4,  user:'ps.director@lnmiit.ac.in', role:'Secretary',  action:'Uploaded',  module:'Documents', details:'Uploaded NAAC Self Study Report 2026',               timestamp:'2026-05-30 17:30:00' },
        { id:5,  user:'faculty@lnmiit.ac.in',    role:'Faculty',    action:'Submitted', module:'Requests',  details:'Submitted meeting request to Director',              timestamp:'2026-05-30 16:45:00' },
        { id:6,  user:'ps.director@lnmiit.ac.in', role:'Secretary',  action:'Approved',  module:'Visitors',  details:'Approved visitor request: Mr. Rajesh Gupta',         timestamp:'2026-05-30 15:20:00' },
        { id:7,  user:'director@lnmiit.ac.in',   role:'Director',   action:'Login',     module:'Auth',      details:'Director logged in successfully',                    timestamp:'2026-05-30 09:00:00' },
        { id:8,  user:'ps.director@lnmiit.ac.in', role:'Secretary',  action:'Created',   module:'Tasks',     details:'Created task: Prepare Director weekly brief',        timestamp:'2026-05-29 14:10:00' },
        { id:9,  user:'ps.director@lnmiit.ac.in', role:'Secretary',  action:'Updated',   module:'Tasks',     details:'Updated task status to Completed',                   timestamp:'2026-05-29 13:00:00' },
        { id:10, user:'faculty@lnmiit.ac.in',    role:'Faculty',    action:'Login',     module:'Auth',      details:'Faculty logged in successfully',                     timestamp:'2026-05-29 10:30:00' },
        { id:11, user:'director@lnmiit.ac.in',   role:'Director',   action:'Viewed',    module:'Documents', details:'Viewed Research Fund Approval Letter',               timestamp:'2026-05-28 16:00:00' },
        { id:12, user:'ps.director@lnmiit.ac.in', role:'Secretary',  action:'Deleted',   module:'Documents', details:'Deleted outdated policy document',                   timestamp:'2026-05-28 11:30:00' },
      ]);
    }
    setLoading(false);
  };

  const modules = ['all', 'Auth', 'Requests', 'Calendar', 'Tasks', 'Documents', 'Visitors'];

  const filtered = logs
    .filter(l => filterModule === 'all' || l.module === filterModule)
    .filter(l =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
    );

  const actionBg = {
    Approved: '#DCFCE7', Rejected: '#FEE2E2', Created: '#DBEAFE',
    Uploaded: '#EDE9FE', Submitted: '#FEF3C7', Login: '#F0FDF4',
    Updated: '#DBEAFE', Deleted: '#FEE2E2', Viewed: '#F8FAFC',
  };
  const actionColor = {
    Approved: '#166534', Rejected: '#991B1B', Created: '#1E40AF',
    Uploaded: '#5B21B6', Submitted: '#92400E', Login: '#166534',
    Updated: '#1E40AF', Deleted: '#991B1B', Viewed: '#64748B',
  };
  const roleBg    = { Director:'#FEE2E2', Secretary:'#DBEAFE', Faculty:'#DCFCE7', Visitor:'#EDE9FE' };
  const roleColor = { Director:'#991B1B', Secretary:'#1E40AF', Faculty:'#166534', Visitor:'#5B21B6' };

  return (
    <div style={styles.page}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoRow}>
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
          </div>
          <div style={styles.logoTitle}>DOP Portal</div>
          <div style={styles.logoSub}>Director's Office</div>
        </div>
        {[
          {label:'Dashboard',  path:'/dashboard'},
          {label:'Calendar',   path:'/calendar'},
          {label:'Requests',   path:'/requests'},
          {label:'Documents',  path:'/documents'},
          {label:'Visitors',   path:'/visitors'},
          {label:'Tasks',      path:'/tasks'},
          {label:'Reports',    path:'/reports'},
          {label:'Audit Logs', path:'/audit-logs'},
          {label:'Settings',   path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(item.path === window.location.pathname ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>PS</div>
          <div style={{flex:1}}>
            <div style={styles.userName}>Priya S.</div>
            <div style={styles.userRole}>Secretary</div>
          </div>
          <div style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.topbarSub}>Director's Office Portal</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 Secretary ▾</div>
          </div>
        </div>

        <div style={styles.content}>

          {/* HEADER */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📋 Audit Logs</div>
              <div style={styles.pageSub}>Track all actions performed in the portal</div>
            </div>
            <button style={styles.exportBtn}>⬇ Export Logs</button>
          </div>

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              {label:'Total Actions', num:logs.length,                                           bg:'#EFF6FF', color:'#1A3A6B'},
              {label:'Today',         num:logs.filter(l=>l.timestamp.startsWith('2026-05-31')).length, bg:'#DCFCE7', color:'#166534'},
              {label:'Approvals',     num:logs.filter(l=>l.action==='Approved').length,          bg:'#DCFCE7', color:'#166534'},
              {label:'Rejections',    num:logs.filter(l=>l.action==='Rejected').length,          bg:'#FEE2E2', color:'#991B1B'},
            ].map((s,i) => (
              <div key={i} style={{...styles.statCard, background:s.bg}}>
                <div style={{...styles.statNum, color:s.color}}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* SEARCH + FILTER */}
          <div style={styles.filterRow}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="🔍  Search by user, action, or details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={styles.tabs}>
              {modules.map(mod => (
                <div key={mod}
                  style={{...styles.tab, ...(filterModule===mod ? styles.tabActive : {})}}
                  onClick={() => setFilterModule(mod)}
                >
                  {mod === 'all' ? 'All' : mod}
                </div>
              ))}
            </div>
          </div>

          {/* LOGS TABLE */}
          <div style={styles.tableWrap}>
            <div style={styles.tableHeader}>
              <div style={{...styles.th, flex:0.8}}>Time</div>
              <div style={{...styles.th, flex:1.2}}>User</div>
              <div style={{...styles.th, flex:0.7}}>Role</div>
              <div style={{...styles.th, flex:0.7}}>Action</div>
              <div style={{...styles.th, flex:0.8}}>Module</div>
              <div style={{...styles.th, flex:2}}>Details</div>
            </div>

            {loading ? (
              <div style={styles.loading}>Loading audit logs...</div>
            ) : filtered.length === 0 ? (
              <div style={styles.loading}>No logs found</div>
            ) : (
              filtered.map(log => (
                <div key={log.id} style={styles.tableRow}>
                  <div style={{...styles.td, flex:0.8}}>
                    <div style={styles.timeMain}>{log.timestamp.split(' ')[1]}</div>
                    <div style={styles.timeSub}>{log.timestamp.split(' ')[0]}</div>
                  </div>
                  <div style={{...styles.td, flex:1.2}}>
                    <div style={styles.userEmail}>{log.user}</div>
                  </div>
                  <div style={{...styles.td, flex:0.7}}>
                    <span style={{...styles.badge2, background:roleBg[log.role]||'#F8FAFC', color:roleColor[log.role]||'#64748B'}}>{log.role}</span>
                  </div>
                  <div style={{...styles.td, flex:0.7}}>
                    <span style={{...styles.badge2, background:actionBg[log.action]||'#F8FAFC', color:actionColor[log.action]||'#64748B'}}>{log.action}</span>
                  </div>
                  <div style={{...styles.td, flex:0.8}}>
                    <span style={styles.moduleBadge}>{log.module}</span>
                  </div>
                  <div style={{...styles.td, flex:2}}>
                    <span style={styles.details}>{log.details}</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:          { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA', overflow:'hidden' },
  sidebar:       { width:'168px', background:'#122951', display:'flex', flexDirection:'column', flexShrink:0 },
  sidebarLogo:   { padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'10px' },
  logoRow:       { display:'flex', gap:'6px', marginBottom:'8px' },
  badge:         { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  logoTitle:     { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:       { color:'rgba(255,255,255,0.4)', fontSize:'9px' },
  navItem:       { display:'flex', alignItems:'center', padding:'9px 16px', margin:'1px 8px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:'500' },
  navActive:     { background:'rgba(37,99,235,0.35)', color:'#fff' },
  sidebarFooter: { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'8px' },
  avatar:        { width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  userName:      { color:'#fff', fontSize:'11px', fontWeight:'600' },
  userRole:      { color:'rgba(255,255,255,0.45)', fontSize:'9px' },
  logoutBtn:     { color:'rgba(255,255,255,0.5)', fontSize:'16px', cursor:'pointer', padding:'4px' },
  main:          { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:        { background:'#1A3A6B', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  topbarTitle:   { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:     { color:'rgba(255,255,255,0.5)', fontSize:'10px', marginTop:'1px' },
  topbarRight:   { display:'flex', alignItems:'center', gap:'10px' },
  notifBtn:      { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 10px', color:'#fff', fontSize:'14px', cursor:'pointer' },
  rolePill:      { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  content:       { flex:1, overflowY:'auto', padding:'18px 22px' },
  pageHeader:    { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:     { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:       { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  exportBtn:     { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  statRow:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:      { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' },
  statNum:       { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  filterRow:     { display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' },
  searchInput:   { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', background:'#fff' },
  tabs:          { display:'flex', gap:'4px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', flexWrap:'wrap' },
  tab:           { padding:'5px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:     { background:'#1A3A6B', color:'#fff' },
  tableWrap:     { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  tableHeader:   { display:'flex', alignItems:'center', padding:'10px 16px', background:'#F8FAFC', borderBottom:'1px solid #E2E8F0' },
  th:            { fontSize:'10px', fontWeight:'700', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px' },
  tableRow:      { display:'flex', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid #F8FAFC' },
  td:            { display:'flex', alignItems:'center', paddingRight:'8px' },
  timeMain:      { fontSize:'11px', fontWeight:'600', color:'#1E293B', fontFamily:'monospace' },
  timeSub:       { fontSize:'9px', color:'#94A3B8', fontFamily:'monospace' },
  userEmail:     { fontSize:'10px', color:'#475569', fontWeight:'500' },
  badge2:        { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px' },
  moduleBadge:   { fontSize:'9px', fontWeight:'600', padding:'3px 9px', borderRadius:'10px', background:'#EFF6FF', color:'#1A3A6B' },
  details:       { fontSize:'11px', color:'#475569' },
  loading:       { padding:'30px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default AuditLogs;