import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function DirectorDashboard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState({ requests: 0, meetings: 0, visitors: 0, tasks: 0 });
  const [notifications, setNotifications] = useState([]);

  const name = localStorage.getItem('name') || 'Director';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  const priBg    = { High:'#FEE2E2', Medium:'#DBEAFE', Low:'#DCFCE7' };
  const priColor = { High:'#991B1B', Medium:'#1E40AF', Low:'#166534' };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, evRes, taskRes, visRes, notifRes] = await Promise.all([
        API.get('/meetings/all'),
        API.get('/events/full'),
        API.get('/tasks'),
        API.get('/visitors/today'),
        API.get('/user/notifications')
      ]);

      if (reqRes.data.success) {
        const pending = reqRes.data.data.filter(r => r.status === 'Pending');
        setRequests(pending.slice(0, 4));
        setStats(prev => ({ ...prev, requests: pending.length }));
      }

      if (evRes.data.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = evRes.data.data.filter(e => e.start_time.split('T')[0] === today);
        setSchedule(todayEvents.slice(0, 4));
        setStats(prev => ({ ...prev, meetings: todayEvents.length }));
      }

      if (taskRes.data.success) {
        const active = [...taskRes.data.data['Pending'], ...taskRes.data.data['In Progress']];
        setStats(prev => ({ ...prev, tasks: active.length }));
      }

      if (visRes.data.success) {
        setStats(prev => ({ ...prev, visitors: visRes.data.data.length }));
      }

      if (notifRes.data.success) {
        setNotifications(notifRes.data.data.filter(n => !n.read_status).slice(0, 3));
      }

    } catch (err) {
      console.log('Error fetching director data:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/approve`);
      if (res.data.success) {
        alert('Request approved!');
        fetchData();
      }
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/reject`);
      if (res.data.success) {
        alert('Request rejected!');
        fetchData();
      }
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getTypeStyle = (type) => {
    if (type === 'Confidential') return { tagBg: '#FEE2E2', tagColor: '#991B1B', dot: '#EF4444' };
    if (type === 'Internal') return { tagBg: '#FEF3C7', tagColor: '#92400E', dot: '#F59E0B' };
    return { tagBg: '#DBEAFE', tagColor: '#1E40AF', dot: '#2563EB' };
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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
          {label:'Dashboard',  path:'/director-dashboard'},
          {label:'Requests',   path:'/director-requests'},
          {label:'Calendar',   path:'/calendar'},
          {label:'Documents',  path:'/documents'},
          {label:'Visitors',   path:'/visitors'},
          {label:'Tasks',      path:'/tasks'},
          {label:'Reports',    path:'/reports'},
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
          <div style={styles.avatar}>{initials}</div>
          <div style={{flex:1}}>
            <div style={styles.userName}>{name}</div>
            <div style={styles.userRole}>Director</div>
          </div>
          <div style={styles.logoutBtn} onClick={handleLogout}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal - LNMIIT</div>
            <div style={styles.topbarSub}>Director's View</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔 {notifications.length > 0 ? `(${notifications.length})` : ''}</div>
            <div style={styles.rolePill}>👤 Director ▾</div>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.greeting}>
            Good morning, <span style={{color:'#2563EB', fontWeight:'700'}}>{name}</span>
            &nbsp;— {today} &nbsp;|&nbsp; Have a productive day!
          </div>

          {/* STAT CARDS */}
          <div style={styles.statGrid}>
            {[
              {icon:'📋', num: stats.requests,  label:'Pending Approvals', bg:'#FEE2E2', color:'#991B1B'},
              {icon:'📅', num: stats.meetings,  label:"Today's Meetings",  bg:'#EFF6FF', color:'#1A3A6B'},
              {icon:'👥', num: stats.visitors,  label:'Visitors Today',    bg:'#F0FDF4', color:'#166534'},
              {icon:'✅', num: stats.tasks,     label:'Active Tasks',      bg:'#FFFBEB', color:'#92400E'},
            ].map((s,i) => (
              <div key={i} style={styles.statCard}>
                <div style={{...styles.statIcon, background:s.bg}}>{s.icon}</div>
                <div>
                  <div style={{...styles.statNum, color:s.color}}>{s.num}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.midRow}>
            {/* PENDING APPROVALS */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📋 Pending Approvals</span>
                <span style={styles.viewAll} onClick={() => navigate('/director-requests')}>View all →</span>
              </div>
              {requests.length === 0 ? (
                <div style={styles.emptyMsg}>No pending approvals</div>
              ) : requests.map((req, i) => (
                <div key={i} style={styles.reqItem}>
                  <div style={{...styles.reqAvatar, background:'#1A3A6B'}}>
                    {req.purpose ? req.purpose[0].toUpperCase() : 'R'}
                  </div>
                  <div style={{flex:1}}>
                    <div style={styles.reqName}>{req.purpose ? req.purpose.slice(0, 25) + '...' : 'No purpose'}</div>
                    <div style={styles.reqDept}>{req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : 'No date'}</div>
                  </div>
                  <span style={{...styles.tag, background:priBg[req.priority], color:priColor[req.priority]}}>{req.priority}</span>
                  <div style={styles.actionBtns}>
                    <button style={styles.approveBtn} onClick={() => handleApprove(req.id)}>✓</button>
                    <button style={styles.rejectBtn} onClick={() => handleReject(req.id)}>✗</button>
                  </div>
                </div>
              ))}
            </div>

            {/* TODAY'S SCHEDULE */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📅 Today's Schedule</span>
                <span style={styles.viewAll} onClick={() => navigate('/calendar')}>View all →</span>
              </div>
              {schedule.length === 0 ? (
                <div style={styles.emptyMsg}>No events today</div>
              ) : schedule.map((ev, i) => {
                const s = getTypeStyle(ev.type);
                const time = new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={i} style={styles.schItem}>
                    <span style={styles.schTime}>{time}</span>
                    <div style={{...styles.dot, background: s.dot}}></div>
                    <span style={styles.schTitle}>{ev.title}</span>
                    <span style={{...styles.tag, background: s.tagBg, color: s.tagColor}}>{ev.type}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOTIFICATIONS */}
          {notifications.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>🔔 New Notifications</span>
              </div>
              <div style={{padding:'8px 16px'}}>
                {notifications.map((n, i) => (
                  <div key={i} style={{...styles.alertItem, background:'#EFF6FF', border:'1px solid #BFDBFE'}}>
                    <span style={{fontSize:'16px'}}>🔔</span>
                    <div>
                      <div style={styles.alertTitle}>{n.message}</div>
                      <div style={styles.alertBody}>{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
  logoutBtn:     { color:'rgba(255,255,255,0.5)', fontSize:'16px', cursor:'pointer', padding:'4px' },
  main:          { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:        { background:'#1A3A6B', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  topbarTitle:   { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:     { color:'rgba(255,255,255,0.5)', fontSize:'10px', marginTop:'1px' },
  topbarRight:   { display:'flex', alignItems:'center', gap:'10px' },
  notifBtn:      { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 10px', color:'#fff', fontSize:'14px', cursor:'pointer' },
  rolePill:      { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  content:       { flex:1, overflowY:'auto', padding:'18px 22px' },
  greeting:      { fontSize:'13px', color:'#475569', marginBottom:'16px' },
  statGrid:      { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' },
  statCard:      { background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  statIcon:      { width:'42px', height:'42px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 },
  statNum:       { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'10px', color:'#64748B', marginTop:'3px', fontWeight:'500' },
  midRow:        { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' },
  card:          { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'12px' },
  cardHeader:    { padding:'13px 16px 10px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle:     { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  viewAll:       { fontSize:'10px', color:'#2563EB', fontWeight:'600', cursor:'pointer' },
  reqItem:       { display:'flex', alignItems:'center', gap:'10px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC' },
  reqAvatar:     { width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', color:'#fff', flexShrink:0 },
  reqName:       { fontSize:'11px', fontWeight:'600', color:'#1E293B' },
  reqDept:       { fontSize:'9px', color:'#94A3B8' },
  tag:           { fontSize:'8px', fontWeight:'600', padding:'3px 8px', borderRadius:'10px', flexShrink:0 },
  actionBtns:    { display:'flex', gap:'4px', flexShrink:0 },
  approveBtn:    { background:'#DCFCE7', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'6px', padding:'4px 8px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  rejectBtn:     { background:'#FEE2E2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:'6px', padding:'4px 8px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  schItem:       { display:'flex', alignItems:'center', gap:'10px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC' },
  schTime:       { fontSize:'10px', color:'#94A3B8', width:'36px', flexShrink:0, fontFamily:'monospace' },
  dot:           { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  schTitle:      { fontSize:'11px', fontWeight:'600', color:'#1E293B', flex:1 },
  alertItem:     { display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 12px', borderRadius:'9px', margin:'8px 0' },
  alertTitle:    { fontSize:'11px', fontWeight:'700', color:'#1E293B', marginBottom:'2px' },
  alertBody:     { fontSize:'9px', color:'#64748B', lineHeight:1.4 },
  emptyMsg:      { padding:'16px', fontSize:'11px', color:'#94A3B8', textAlign:'center' },
};

export default DirectorDashboard;