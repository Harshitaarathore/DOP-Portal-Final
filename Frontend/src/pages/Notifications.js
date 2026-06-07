import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [notifications, setNotifications] = useState([
    { id:1, type:'request',  title:'New Meeting Request',       body:'Dr. Sharma submitted a meeting request',     time:'2 hours ago',  read:false, icon:'📋' },
    { id:2, type:'approval', title:'Request Approved',          body:'Your leave request has been approved',        time:'4 hours ago',  read:false, icon:'✅' },
    { id:3, type:'visitor',  title:'Visitor Appointment',       body:'Mr. Rajesh Gupta visit approved for today',   time:'Yesterday',    read:false, icon:'👥' },
    { id:4, type:'task',     title:'Task Assigned',             body:'Prepare Director weekly brief by today',      time:'Yesterday',    read:true,  icon:'✅' },
    { id:5, type:'alert',    title:'NAAC Deadline Tomorrow',    body:'Submit compliance report by 5 PM tomorrow',   time:'2 days ago',   read:true,  icon:'⚠️' },
    { id:6, type:'request',  title:'Request Rejected',          body:'Prof. Mehta leave request was rejected',      time:'2 days ago',   read:true,  icon:'❌' },
    { id:7, type:'visitor',  title:'New Visitor Request',       body:'Dr. Anil Sharma from IIT Delhi requesting visit', time:'3 days ago', read:true, icon:'👥' },
  ]);

  const goHome = () => {
    if (role === 'Director')       navigate('/director-dashboard');
    else if (role === 'Secretary') navigate('/dashboard');
    else if (role === 'Faculty')   navigate('/faculty-dashboard');
    else navigate('/');
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read:true} : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read:true})));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeBg    = { request:'#EFF6FF', approval:'#DCFCE7', visitor:'#EDE9FE', task:'#DCFCE7', alert:'#FFFBEB' };
  const typeColor = { request:'#1E40AF', approval:'#166534', visitor:'#5B21B6', task:'#166534', alert:'#92400E' };

  return (
    <div style={styles.page}>

      {/* TOPBAR */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <div style={styles.logoRow}>
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
          </div>
          <div>
            <div style={styles.topbarTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.topbarSub}>Notifications</div>
          </div>
        </div>
        <div style={styles.topbarRight}>
          <button style={styles.backBtn} onClick={goHome}>← Back to Dashboard</button>
          <div style={styles.rolePill}>👤 {role} ▾</div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {/* HEADER */}
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.pageTitle}>
              🔔 Notifications
              {unreadCount > 0 && (
                <span style={styles.unreadBadge}>{unreadCount} new</span>
              )}
            </div>
            <div style={styles.pageSub}>All your notifications in one place</div>
          </div>
          {unreadCount > 0 && (
            <button style={styles.markAllBtn} onClick={markAllRead}>
              ✓ Mark all as read
            </button>
          )}
        </div>

        {/* NOTIFICATIONS LIST */}
        <div style={styles.listWrap}>
          {notifications.map(notif => (
            <div
              key={notif.id}
              style={{...styles.notifCard, ...(notif.read ? styles.notifRead : styles.notifUnread)}}
              onClick={() => markRead(notif.id)}
            >
              <div style={{...styles.notifIcon, background:typeBg[notif.type], color:typeColor[notif.type]}}>
                {notif.icon}
              </div>
              <div style={styles.notifBody}>
                <div style={styles.notifTitle}>{notif.title}</div>
                <div style={styles.notifText}>{notif.body}</div>
                <div style={styles.notifTime}>{notif.time}</div>
              </div>
              {!notif.read && <div style={styles.unreadDot}></div>}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA' },
  topbar:       { background:'#1A3A6B', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  topbarLeft:   { display:'flex', alignItems:'center', gap:'12px' },
  logoRow:      { display:'flex', gap:'6px' },
  badge:        { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  topbarTitle:  { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:    { color:'rgba(255,255,255,0.5)', fontSize:'10px' },
  topbarRight:  { display:'flex', alignItems:'center', gap:'10px' },
  backBtn:      { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'6px 14px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer' },
  rolePill:     { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600' },
  content:      { maxWidth:'700px', margin:'0 auto', padding:'24px 20px' },
  pageHeader:   { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  pageTitle:    { fontSize:'18px', fontWeight:'700', color:'#1E293B', display:'flex', alignItems:'center', gap:'10px' },
  unreadBadge:  { background:'#EF4444', color:'#fff', fontSize:'10px', fontWeight:'700', padding:'3px 8px', borderRadius:'10px' },
  pageSub:      { fontSize:'11px', color:'#64748B', marginTop:'3px' },
  markAllBtn:   { background:'#EFF6FF', color:'#1A3A6B', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'8px 16px', fontSize:'11px', fontWeight:'600', cursor:'pointer' },
  listWrap:     { display:'flex', flexDirection:'column', gap:'8px' },
  notifCard:    { display:'flex', alignItems:'flex-start', gap:'12px', padding:'14px 16px', borderRadius:'12px', cursor:'pointer', border:'1px solid #E2E8F0' },
  notifUnread:  { background:'#fff', borderLeft:'4px solid #2563EB', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' },
  notifRead:    { background:'#F8FAFC', borderLeft:'4px solid transparent' },
  notifIcon:    { width:'40px', height:'40px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 },
  notifBody:    { flex:1 },
  notifTitle:   { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'3px' },
  notifText:    { fontSize:'11px', color:'#475569', lineHeight:1.5, marginBottom:'5px' },
  notifTime:    { fontSize:'10px', color:'#94A3B8' },
  unreadDot:    { width:'10px', height:'10px', borderRadius:'50%', background:'#2563EB', flexShrink:0, marginTop:'4px' },
};

export default Notifications;