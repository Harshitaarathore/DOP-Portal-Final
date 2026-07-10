import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Notifications() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'User';
  const role = localStorage.getItem('role') || '';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const [notifications, setNotifications] = useState([]);

  const dashPath = role === 'Director' ? '/director-dashboard' : role === 'Staff' ? '/staff-portal' : '/dashboard';

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/user/notifications');
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) { console.log(err); }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read_status: 1 })));
    try {
      await API.put('/user/notifications/read-all');
    } catch (err) { console.log(err); }
  };

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_status: 1 } : n));
    try {
      await API.put(`/user/notifications/${id}/read`);
    } catch (err) { console.log(err); }
  };

  const unreadCount = notifications.filter(n => n.read_status === 0).length;

  return (
    <div style={S.page}>
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
          <button style={S.btnBack} onClick={() => navigate(dashPath)}>← Back to Dashboard</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={S.content}>
        <div style={S.header}>
          <div>
            <div style={S.pageTitle}>🔔 Notifications</div>
            <div style={S.pageSub}>
              {unreadCount > 0 ? <span style={S.badge}>{unreadCount} new</span> : null}
              All your notifications in one place
            </div>
          </div>
          {unreadCount > 0 && (
            <button style={S.markAllBtn} onClick={markAllRead}>✓ Mark all as read</button>
          )}
        </div>

        <div style={S.list}>
          {notifications.length === 0 ? (
            <div style={S.empty}>No notifications yet</div>
          ) : notifications.map((n, i) => (
            <div key={i}
              style={{ ...S.notifItem, ...(n.read_status === 0 ? S.notifUnread : {}) }}
              onClick={() => markRead(n.id)}
            >
              <div style={S.notifIcon}>
  {n.type === 'meeting' ? '📋' 
  : n.type === 'task' ? '✅' 
  : n.type === 'visitor' ? '👥' 
  : n.type === 'announcement' ? '📢'
  : n.type === 'event' ? '📅'
  : '🔔'}
</div>
              <div style={{ flex: 1 }}>
                <div style={S.notifTitle}>{n.message}</div>
                <div style={S.notifTime}>{new Date(n.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · {new Date(n.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}</div>
              </div>
              {n.read_status === 0 && <div style={S.unreadDot} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const S = {
  page:          { minHeight:'100vh', background:'#F5F7FA', fontFamily:"'DM Sans',sans-serif" },
  topbar:        { background:'#fff', padding:'10px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:10 },
  topbarUser:    { display:'flex', alignItems:'center', gap:'10px' },
  topbarAvatar:  { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff' },
  topbarUserName:{ color:'#1A3A6B', fontSize:'13px', fontWeight:'700' },
  topbarUserEmail:{ color:'#94A3B8', fontSize:'9px' },
  topbarUserRole:{ color:'#64748B', fontSize:'10px' },
  topbarRight:   { display:'flex', gap:'8px' },
  btnBack:       { background:'transparent', color:'#1A3A6B', border:'1px solid #1A3A6B', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  content:       { maxWidth:'720px', margin:'0 auto', padding:'28px 20px' },
  header:        { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' },
  pageTitle:     { fontSize:'18px', fontWeight:'700', color:'#1E293B', marginBottom:'4px' },
  pageSub:       { fontSize:'12px', color:'#64748B', display:'flex', alignItems:'center', gap:'8px' },
  badge:         { background:'#EF4444', color:'#fff', borderRadius:'20px', padding:'2px 8px', fontSize:'10px', fontWeight:'700' },
  markAllBtn:    { background:'transparent', color:'#2563EB', border:'1px solid #2563EB', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
  list:          { display:'flex', flexDirection:'column', gap:'8px' },
  notifItem:     { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', transition:'all 0.2s ease' },
  notifUnread:   { borderLeft:'3px solid #2563EB', background:'#F8FAFF' },
  notifIcon:     { width:'36px', height:'36px', borderRadius:'8px', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 },
  notifTitle:    { fontSize:'13px', fontWeight:'600', color:'#1E293B', marginBottom:'4px' },
  notifTime:     { fontSize:'10px', color:'#94A3B8' },
  unreadDot:     { width:'8px', height:'8px', borderRadius:'50%', background:'#2563EB', flexShrink:0 },
  empty:         { textAlign:'center', padding:'40px', color:'#94A3B8', fontSize:'13px' },
};

export default Notifications;