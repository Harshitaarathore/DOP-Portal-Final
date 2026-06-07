import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Reports() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/reports');
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.log('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (arr, key, value) => {
    const found = arr?.find(item => item[key] === value);
    return found ? found.count : 0;
  };

  const totals = data?.totals || {};
  const requestStatus = data?.requestStatus || [];
  const taskStatus = data?.taskStatus || [];
  const visitorStatus = data?.visitorStatus || [];
  const meetingsPerDay = data?.meetingsPerDay || [];
  const requestsByDept = data?.requestsByDept || [];
  const timeUtilization = data?.timeUtilization || [];
  const tasksByPriority = data?.tasksByPriority || [];

  const maxDeptCount = requestsByDept.length > 0 ? Math.max(...requestsByDept.map(d => d.count)) : 1;
  const maxTimeCount = timeUtilization.length > 0 ? Math.max(...timeUtilization.map(t => t.count)) : 1;
  const maxDayCount = meetingsPerDay.length > 0 ? Math.max(...meetingsPerDay.map(m => m.count)) : 1;

  const approvalRate = totals.total_requests > 0
    ? Math.round((getStatusCount(requestStatus, 'status', 'Approved') / totals.total_requests) * 100)
    : 0;

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
          {label:'Dashboard', path:'/dashboard'},
          {label:'Calendar',  path:'/calendar'},
          {label:'Requests',  path:'/requests'},
          {label:'Documents', path:'/documents'},
          {label:'Visitors',  path:'/visitors'},
          {label:'Tasks',     path:'/tasks'},
          {label:'Reports',   path:'/reports'},
          {label:'Settings',  path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(i===6 ? styles.navActive : {})}}
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
          <div>
            <div style={styles.topbarTitle}>DOP Portal - LNMIIT</div>
            <div style={styles.topbarSub}>Director's Office Portal</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 {role} ▾</div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📊 Reports & Analytics</div>
              <div style={styles.pageSub}>Analytics and statistics for Director's Office</div>
            </div>
          </div>

          {/* TABS */}
          <div style={styles.tabs}>
            {[
              {key:'overview',    label:'Overview'},
              {key:'requests',    label:'Requests'},
              {key:'tasks',       label:'Tasks'},
              {key:'utilization', label:'Time Utilization'},
            ].map(tab => (
              <div key={tab.key}
                style={{...styles.tab, ...(activeTab===tab.key ? styles.tabActive : {})}}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {loading ? (
            <div style={styles.emptyMsg}>Loading reports...</div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <>
                  <div style={styles.statGrid}>
                    {[
                      {icon:'📅', label:'Total Events',    value: totals.total_events || 0,    bg:'#EFF6FF', color:'#1A3A6B'},
                      {icon:'📋', label:'Total Requests',  value: totals.total_requests || 0,  bg:'#FEF3C7', color:'#92400E'},
                      {icon:'✅', label:'Total Tasks',     value: totals.total_tasks || 0,     bg:'#DCFCE7', color:'#166534'},
                      {icon:'👥', label:'Total Visitors',  value: totals.total_visitors || 0,  bg:'#EDE9FE', color:'#5B21B6'},
                      {icon:'📁', label:'Total Documents', value: totals.total_documents || 0, bg:'#FEE2E2', color:'#991B1B'},
                      {icon:'✔',  label:'Approval Rate',   value: `${approvalRate}%`,          bg:'#DCFCE7', color:'#166534'},
                    ].map((s,i) => (
                      <div key={i} style={{...styles.statCard, background:s.bg}}>
                        <div style={styles.statIcon}>{s.icon}</div>
                        <div style={{...styles.statNum, color:s.color}}>{s.value}</div>
                        <div style={styles.statLabel}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.midRow}>
                    <div style={styles.card}>
                      <div style={styles.cardHeader}><span style={styles.cardTitle}>📅 Events This Week</span></div>
                      <div style={styles.chartWrap}>
                        {meetingsPerDay.length === 0 ? (
                          <div style={styles.emptyMsg}>No events this week</div>
                        ) : meetingsPerDay.map((m, i) => (
                          <div key={i} style={styles.barGroup}>
                            <div style={styles.barLabel}>{m.count}</div>
                            <div style={styles.barOuter}>
                              <div style={{...styles.barFill, height:`${(m.count/maxDayCount)*100}%`}}></div>
                            </div>
                            <div style={styles.barMonth}>{new Date(m.date).toLocaleDateString('en-US', {weekday:'short'})}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={styles.card}>
                      <div style={styles.cardHeader}><span style={styles.cardTitle}>📋 Request Status</span></div>
                      <div style={{padding:'12px 16px'}}>
                        {[
                          {label:'Pending',     value: getStatusCount(requestStatus,'status','Pending'),    color:'#F59E0B'},
                          {label:'Approved',    value: getStatusCount(requestStatus,'status','Approved'),   color:'#10B981'},
                          {label:'Rejected',    value: getStatusCount(requestStatus,'status','Rejected'),   color:'#EF4444'},
                          {label:'Rescheduled', value: getStatusCount(requestStatus,'status','Rescheduled'),color:'#7C3AED'},
                        ].map((r,i) => (
                          <div key={i} style={styles.reqRow}>
                            <div style={styles.reqInfo}>
                              <div style={{...styles.reqDot, background:r.color}}></div>
                              <span style={styles.reqType}>{r.label}</span>
                            </div>
                            <div style={styles.reqBarWrap}>
                              <div style={styles.reqBarBg}>
                                <div style={{...styles.reqBarFill, width: totals.total_requests > 0 ? `${(r.value/totals.total_requests)*100}%` : '0%', background:r.color}}></div>
                              </div>
                              <span style={styles.reqCount}>{r.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* REQUESTS TAB */}
              {activeTab === 'requests' && (
                <div style={styles.midRow}>
                  <div style={styles.card}>
                    <div style={styles.cardHeader}><span style={styles.cardTitle}>🏢 Requests per Department</span></div>
                    <div style={{padding:'12px 16px'}}>
                      {requestsByDept.length === 0 ? (
                        <div style={styles.emptyMsg}>No department data available</div>
                      ) : requestsByDept.map((d, i) => (
                        <div key={i} style={styles.reqRow}>
                          <div style={styles.reqInfo}>
                            <div style={{...styles.reqDot, background:'#2563EB'}}></div>
                            <span style={styles.reqType}>{d.department || 'Unknown'}</span>
                          </div>
                          <div style={styles.reqBarWrap}>
                            <div style={styles.reqBarBg}>
                              <div style={{...styles.reqBarFill, width:`${(d.count/maxDeptCount)*100}%`, background:'#2563EB'}}></div>
                            </div>
                            <span style={styles.reqCount}>{d.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.cardHeader}><span style={styles.cardTitle}>📋 Visitor Status</span></div>
                    <div style={{padding:'12px 16px'}}>
                      {[
                        {label:'Pending',  value: getStatusCount(visitorStatus,'approval_status','Pending'),  color:'#F59E0B'},
                        {label:'Approved', value: getStatusCount(visitorStatus,'approval_status','Approved'), color:'#10B981'},
                        {label:'Rejected', value: getStatusCount(visitorStatus,'approval_status','Rejected'), color:'#EF4444'},
                      ].map((r,i) => (
                        <div key={i} style={styles.reqRow}>
                          <div style={styles.reqInfo}>
                            <div style={{...styles.reqDot, background:r.color}}></div>
                            <span style={styles.reqType}>{r.label}</span>
                          </div>
                          <div style={styles.reqBarWrap}>
                            <div style={styles.reqBarBg}>
                              <div style={{...styles.reqBarFill, width: totals.total_visitors > 0 ? `${(r.value/totals.total_visitors)*100}%` : '0%', background:r.color}}></div>
                            </div>
                            <span style={styles.reqCount}>{r.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TASKS TAB */}
              {activeTab === 'tasks' && (
                <div style={styles.midRow}>
                  <div style={styles.card}>
                    <div style={styles.cardHeader}><span style={styles.cardTitle}>✅ Task Status</span></div>
                    <div style={{padding:'12px 16px'}}>
                      {[
                        {label:'Pending',     value: getStatusCount(taskStatus,'status','Pending'),     color:'#F59E0B'},
                        {label:'In Progress', value: getStatusCount(taskStatus,'status','In Progress'), color:'#2563EB'},
                        {label:'Completed',   value: getStatusCount(taskStatus,'status','Completed'),   color:'#10B981'},
                      ].map((r,i) => (
                        <div key={i} style={styles.reqRow}>
                          <div style={styles.reqInfo}>
                            <div style={{...styles.reqDot, background:r.color}}></div>
                            <span style={styles.reqType}>{r.label}</span>
                          </div>
                          <div style={styles.reqBarWrap}>
                            <div style={styles.reqBarBg}>
                              <div style={{...styles.reqBarFill, width: totals.total_tasks > 0 ? `${(r.value/totals.total_tasks)*100}%` : '0%', background:r.color}}></div>
                            </div>
                            <span style={styles.reqCount}>{r.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.cardHeader}><span style={styles.cardTitle}>🎯 Tasks by Priority</span></div>
                    <div style={{padding:'12px 16px'}}>
                      {[
                        {label:'High',   value: getStatusCount(tasksByPriority,'priority','High'),   color:'#EF4444'},
                        {label:'Medium', value: getStatusCount(tasksByPriority,'priority','Medium'), color:'#F59E0B'},
                        {label:'Low',    value: getStatusCount(tasksByPriority,'priority','Low'),    color:'#10B981'},
                      ].map((r,i) => (
                        <div key={i} style={styles.reqRow}>
                          <div style={styles.reqInfo}>
                            <div style={{...styles.reqDot, background:r.color}}></div>
                            <span style={styles.reqType}>{r.label}</span>
                          </div>
                          <div style={styles.reqBarWrap}>
                            <div style={styles.reqBarBg}>
                              <div style={{...styles.reqBarFill, width: totals.total_tasks > 0 ? `${(r.value/totals.total_tasks)*100}%` : '0%', background:r.color}}></div>
                            </div>
                            <span style={styles.reqCount}>{r.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TIME UTILIZATION TAB */}
              {activeTab === 'utilization' && (
                <div style={styles.card}>
                  <div style={styles.cardHeader}><span style={styles.cardTitle}>⏰ Time Utilization — Meetings by Hour</span></div>
                  <div style={{...styles.chartWrap, height:'200px', padding:'16px'}}>
                    {timeUtilization.length === 0 ? (
                      <div style={styles.emptyMsg}>No time data available</div>
                    ) : timeUtilization.map((t, i) => (
                      <div key={i} style={styles.barGroup}>
                        <div style={styles.barLabel}>{t.count}</div>
                        <div style={styles.barOuter}>
                          <div style={{...styles.barFill, height:`${(t.count/maxTimeCount)*100}%`, background:'#7C3AED'}}></div>
                        </div>
                        <div style={styles.barMonth}>{t.hour}:00</div>
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
  tabs:          { display:'flex', gap:'4px', marginBottom:'14px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:           { padding:'6px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:     { background:'#1A3A6B', color:'#fff' },
  statGrid:      { display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:      { borderRadius:'10px', padding:'14px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', textAlign:'center' },
  statIcon:      { fontSize:'20px' },
  statNum:       { fontSize:'20px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'9px', color:'#64748B', fontWeight:'500' },
  midRow:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' },
  card:          { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'12px' },
  cardHeader:    { padding:'13px 16px 10px', borderBottom:'1px solid #F1F5F9' },
  cardTitle:     { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  chartWrap:     { display:'flex', alignItems:'flex-end', gap:'8px', padding:'16px 20px', height:'160px', boxSizing:'border-box' },
  barGroup:      { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', flex:1, height:'100%' },
  barLabel:      { fontSize:'10px', fontWeight:'700', color:'#1A3A6B', flexShrink:0 },
  barOuter:      { flex:1, width:'100%', background:'#EFF6FF', borderRadius:'6px', display:'flex', alignItems:'flex-end', overflow:'hidden', minHeight:'10px' },
  barFill:       { width:'100%', background:'#2563EB', borderRadius:'6px' },
  barMonth:      { fontSize:'9px', color:'#94A3B8', fontWeight:'600', flexShrink:0 },
  reqRow:        { marginBottom:'14px' },
  reqInfo:       { display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' },
  reqDot:        { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  reqType:       { fontSize:'11px', fontWeight:'600', color:'#1E293B' },
  reqBarWrap:    { display:'flex', alignItems:'center', gap:'8px' },
  reqBarBg:      { flex:1, height:'6px', background:'#F1F5F9', borderRadius:'3px' },
  reqBarFill:    { height:'100%', borderRadius:'3px', transition:'width 0.3s' },
  reqCount:      { fontSize:'11px', fontWeight:'700', color:'#1E293B', width:'24px', textAlign:'right' },
  emptyMsg:      { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Reports;