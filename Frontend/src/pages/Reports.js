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

function Reports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [toast, setToast] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const role     = localStorage.getItem('role');
  const name     = localStorage.getItem('name') || 'User';
  const email    = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today    = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const { count: notifCount } = useNotifCount();

  const navItems = [
    { label:'Dashboard',     icon:'🏠', path:'/dashboard' },
    { label:'Calendar',      icon:'📅', path:'/calendar' },
    { label:'Requests',      icon:'📋', path:'/requests' },
    { label:'Documents',     icon:'📁', path:'/documents' },
    { label:'Visitors',      icon:'👥', path:'/visitors' },
    { label:'Communication', icon:'💬', path:'/communications' },
    { label:'Tasks',         icon:'✅', path:'/tasks' },
    { label:'Announcements', icon:'📢', path:'/announcements' },
    { label:'Reports',       icon:'📊', path:'/reports' },
    { label:'Settings',      icon:'⚙️', path:'/settings' },
  ];

  useEffect(() => { fetchReports(); }, []);

const fetchReports = async () => {
  setRefreshing(true);
  try {
    const res = await API.get('/reports');
    if (res.data.success) setData(res.data.data);
  } catch (err) {
    console.log('Error fetching reports:', err);
  } finally {
    setLoading(false);
    setRefreshing(false); // this must always run
  }
};

  const getCount = (arr, key, value) => arr?.find(i => i[key] === value)?.count || 0;

  const totals          = data?.totals          || {};
  const requestStatus   = data?.requestStatus   || [];
  const taskStatus      = data?.taskStatus      || [];
  const visitorStatus   = data?.visitorStatus   || [];
  const meetingsPerDay  = data?.meetingsPerDay  || [];
  const requestsByDept  = data?.requestsByDept  || [];
  const timeUtilization = data?.timeUtilization || [];
  const tasksByPriority = data?.tasksByPriority || [];

  const maxDeptCount = requestsByDept.length  > 0 ? Math.max(...requestsByDept.map(d => d.count))  : 1;
  const maxTimeCount = timeUtilization.length > 0 ? Math.max(...timeUtilization.map(t => t.count)) : 1;
  const maxDayCount  = meetingsPerDay.length  > 0 ? Math.max(...meetingsPerDay.map(m => m.count))  : 1;

  const approvalRate = totals.total_requests > 0
    ? Math.round((getCount(requestStatus, 'status', 'Approved') / totals.total_requests) * 100)
    : 0;

  const tabs = [
    { key:'overview',    label:'Overview' },
    { key:'requests',    label:'Requests' },
    { key:'tasks',       label:'Tasks' },
    { key:'utilization', label:'Time Utilization' },
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

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>📊 Reports & Analytics</div>
              <div style={S.pageSub}>Analytics and statistics for Director's Office</div>
            </div>
            <button
  style={{ ...S.refreshBtn, opacity: refreshing ? 0.7 : 1 }}
  onClick={() => { if (!refreshing) fetchReports(); }}
>
  {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
</button>
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

          {loading ? (
            <div style={S.empty}>Loading reports...</div>
          ) : (
            <>
              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <>
                  {/* STAT CARDS */}
                  <div style={S.statGrid}>
                    {[
  { icon:'📅', label:'Total Events',    value: totals.total_events    || 0, bg:'#EFF6FF', color:'#1A3A6B', path:'/calendar' },
  { icon:'📋', label:'Total Requests',  value: totals.total_requests  || 0, bg:'#FEF3C7', color:'#92400E', path:'/requests' },
  { icon:'✅', label:'Total Tasks',     value: totals.total_tasks     || 0, bg:'#DCFCE7', color:'#166534', path:'/tasks' },
  { icon:'👥', label:'Total Visitors',  value: totals.total_visitors  || 0, bg:'#EDE9FE', color:'#5B21B6', path:'/visitors' },
  { icon:'📁', label:'Total Documents', value: totals.total_documents || 0, bg:'#FEE2E2', color:'#991B1B', path:'/documents' },
  { icon:'✔',  label:'Approval Rate',   value: `${approvalRate}%`,         bg:'#DCFCE7', color:'#166534', path:'/requests' },
].map((s, i) => (
  <div key={i}
    style={{
      ...S.statCard,
      background: s.bg,
      cursor: 'pointer',
      transform: hoveredStat === i ? 'translateY(-3px)' : 'none',
      boxShadow: hoveredStat === i ? '0 8px 20px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={() => setHoveredStat(i)}
    onMouseLeave={() => setHoveredStat(null)}
    onClick={() => navigate(s.path)}
  >
    <div style={S.statIcon}>{s.icon}</div>
    <div style={{ ...S.statNum, color:s.color }}>{s.value}</div>
    <div style={S.statLabel}>{s.label}</div>
  </div>
))}
                  </div>

                  <div style={S.row2}>
                    {/* Events this week bar chart */}
                    <div style={S.card}>
                      <div style={S.cardHeader}><span style={S.cardTitle}>📅 Events This Week</span></div>
                      <div style={S.chartWrap}>
                        {meetingsPerDay.length === 0 ? (
                          <div style={S.empty}>No events this week</div>
                        ) : meetingsPerDay.map((m, i) => (
                          <div key={i} style={S.barGroup}>
                            <div style={S.barLabel}>{m.count}</div>
                            <div style={S.barOuter}>
                              <div style={{ ...S.barFill, height:`${(m.count/maxDayCount)*100}%` }} />
                            </div>
                            <div style={S.barMonth}>{new Date(m.date).toLocaleDateString('en-US',{weekday:'short'})}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Request status */}
                    <div style={S.card}>
                      <div style={S.cardHeader}><span style={S.cardTitle}>📋 Request Status</span></div>
                      <div style={{ padding:'12px 16px' }}>
                        {[
                          { label:'Pending',     value: getCount(requestStatus,'status','Pending'),     color:'#F59E0B' },
                          { label:'Approved',    value: getCount(requestStatus,'status','Approved'),    color:'#10B981' },
                          { label:'Rejected',    value: getCount(requestStatus,'status','Rejected'),    color:'#EF4444' },
                          { label:'Rescheduled', value: getCount(requestStatus,'status','Rescheduled'), color:'#7C3AED' },
                        ].map((r, i) => <BarRow key={i} {...r} total={totals.total_requests} />)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── REQUESTS TAB ── */}
              {activeTab === 'requests' && (
                <div style={S.row2}>
                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>🏢 Requests per Department</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {requestsByDept.length === 0 ? (
                        <div style={S.empty}>No department data yet</div>
                      ) : requestsByDept.map((d, i) => (
                        <BarRow key={i} label={d.department || 'Unknown'} value={d.count} total={maxDeptCount} color='#2563EB' />
                      ))}
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>👥 Visitor Status</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {[
                        { label:'Pending',  value: getCount(visitorStatus,'approval_status','Pending'),  color:'#F59E0B' },
                        { label:'Approved', value: getCount(visitorStatus,'approval_status','Approved'), color:'#10B981' },
                        { label:'Rejected', value: getCount(visitorStatus,'approval_status','Rejected'), color:'#EF4444' },
                      ].map((r, i) => <BarRow key={i} {...r} total={totals.total_visitors} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TASKS TAB ── */}
              {activeTab === 'tasks' && (
                <div style={S.row2}>
                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>✅ Task Status</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {[
                        { label:'Pending',     value: getCount(taskStatus,'status','Pending'),     color:'#F59E0B' },
                        { label:'In Progress', value: getCount(taskStatus,'status','In Progress'), color:'#2563EB' },
                        { label:'Completed',   value: getCount(taskStatus,'status','Completed'),   color:'#10B981' },
                      ].map((r, i) => <BarRow key={i} {...r} total={totals.total_tasks} />)}
                    </div>
                  </div>

                  <div style={S.card}>
                    <div style={S.cardHeader}><span style={S.cardTitle}>🎯 Tasks by Priority</span></div>
                    <div style={{ padding:'12px 16px' }}>
                      {[
                        { label:'High',   value: getCount(tasksByPriority,'priority','High'),   color:'#EF4444' },
                        { label:'Medium', value: getCount(tasksByPriority,'priority','Medium'), color:'#F59E0B' },
                        { label:'Low',    value: getCount(tasksByPriority,'priority','Low'),    color:'#10B981' },
                      ].map((r, i) => <BarRow key={i} {...r} total={totals.total_tasks} />)}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TIME UTILIZATION TAB ── */}
              {activeTab === 'utilization' && (
                <div style={S.card}>
                  <div style={S.cardHeader}><span style={S.cardTitle}>⏰ Time Utilization — Meetings by Hour of Day</span></div>
                  <div style={{ ...S.chartWrap, height:'200px', padding:'16px' }}>
                    {timeUtilization.length === 0 ? (
                      <div style={S.empty}>No time data yet</div>
                    ) : timeUtilization.map((t, i) => (
                      <div key={i} style={S.barGroup}>
                        <div style={S.barLabel}>{t.count}</div>
                        <div style={S.barOuter}>
                          <div style={{ ...S.barFill, height:`${(t.count/maxTimeCount)*100}%`, background:'#7C3AED' }} />
                        </div>
                        <div style={S.barMonth}>{t.hour}:00</div>
                      </div>
                    ))}
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

function BarRow({ label, value, total, color = '#2563EB' }) {
  const pct = total > 0 ? `${Math.round((value / total) * 100)}%` : '0%';
  return (
    <div style={{ marginBottom:'14px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:color, flexShrink:0 }} />
        <span style={{ fontSize:'11px', fontWeight:'600', color:'#1E293B', flex:1 }}>{label}</span>
        <span style={{ fontSize:'11px', fontWeight:'700', color:'#1E293B' }}>{value}</span>
      </div>
      <div style={{ height:'6px', background:'#F1F5F9', borderRadius:'3px' }}>
        <div style={{ height:'100%', width:pct, background:color, borderRadius:'3px', transition:'width 0.4s' }} />
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
  tabs:           { display:'flex', gap:'4px', marginBottom:'14px', background:'#F1F5F9', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:            { padding:'6px 16px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  statGrid:       { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:       { borderRadius:'10px', padding:'14px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', textAlign:'center', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  statIcon:       { fontSize:'20px' },
  statNum:        { fontSize:'20px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'9px', color:'#64748B', fontWeight:'500' },
  row2:           { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' },
  card:           { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'12px' },
  cardHeader:     { padding:'13px 16px 10px', borderBottom:'1px solid #F1F5F9' },
  cardTitle:      { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  chartWrap:      { display:'flex', alignItems:'flex-end', gap:'8px', padding:'16px 20px', height:'160px', boxSizing:'border-box' },
  barGroup:       { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', flex:1, height:'100%' },
  barLabel:       { fontSize:'10px', fontWeight:'700', color:'#1A3A6B', flexShrink:0 },
  barOuter:       { flex:1, width:'100%', background:'#EFF6FF', borderRadius:'6px', display:'flex', alignItems:'flex-end', overflow:'hidden', minHeight:'10px' },
  barFill:        { width:'100%', background:'#2563EB', borderRadius:'6px' },
  barMonth:       { fontSize:'9px', color:'#94A3B8', fontWeight:'600', flexShrink:0 },
  empty:          { padding:'30px', textAlign:'center', fontSize:'12px', color:'#94A3B8', width:'100%' },
};

export default Reports;