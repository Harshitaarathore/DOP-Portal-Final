import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function SecretaryDashboard() {
  const navigate = useNavigate();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const name = localStorage.getItem('name') || 'User';
  const role = localStorage.getItem('role') || 'Staff';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  const [stats, setStats] = useState({ requests: 0, meetings: 0, tasks: 0, visitors: 0 });
  const [schedule, setSchedule] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddType, setQuickAddType] = useState('event');
  const [newEvent, setNewEvent] = useState({ title: '', start_time: '', end_time: '', type: 'Public' });
  const [newTask, setNewTask] = useState({ title: '', deadline: '', priority: 'Low' });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, reqRes, tasksRes, visitorsRes, notifRes] = await Promise.all([
        API.get('/events/full'),
        API.get('/meetings/all'),
        API.get('/tasks'),
        API.get('/visitors/today'),
        API.get('/user/notifications')
      ]);

      if (eventsRes.data.success) {
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = eventsRes.data.data.filter(e => e.start_time.split('T')[0] === today);
        setSchedule(todayEvents.slice(0, 4));
        setStats(prev => ({ ...prev, meetings: todayEvents.length }));

        // build alerts from upcoming events
        const upcoming = eventsRes.data.data.filter(e => new Date(e.start_time) > new Date());
        const alertList = [];
        upcoming.slice(0, 3).forEach(ev => {
          alertList.push({
            ic: ev.type === 'Confidential' ? '🔴' : '🔵',
            title: ev.title,
            body: new Date(ev.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            bg: ev.type === 'Confidential' ? '#FFF1F2' : '#EFF6FF',
            border: ev.type === 'Confidential' ? '#FECDD3' : '#BFDBFE'
          });
        });
        setAlerts(alertList);
      }

      if (reqRes.data.success) {
        const pending = reqRes.data.data.filter(r => r.status === 'Pending');
        setRequests(pending.slice(0, 4));
        setStats(prev => ({ ...prev, requests: pending.length }));
      }

      if (tasksRes.data.success) {
        const p = tasksRes.data.data['Pending'].length;
        const ip = tasksRes.data.data['In Progress'].length;
        const c = tasksRes.data.data['Completed'].length;
        setTasks({ pending: p, inProgress: ip, completed: c });
        setStats(prev => ({ ...prev, tasks: p + ip }));
      }

      if (visitorsRes.data.success) {
        setStats(prev => ({ ...prev, visitors: visitorsRes.data.data.length }));
      }

      if (notifRes.data.success) {
        setNotifications(notifRes.data.data.filter(n => n.read_status === 0).slice(0, 3));
      }

    } catch (err) {
      console.log('Dashboard fetch error:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/approve`);
      if (res.data.success) {
        alert('Request approved!');
        fetchDashboardData();
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
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleQuickAddEvent = async () => {
    try {
      const res = await API.post('/events', { ...newEvent, visibility: 'public', notes: '' });
      if (res.data.success) {
        alert('Event created!');
        setShowQuickAdd(false);
        setNewEvent({ title: '', start_time: '', end_time: '', type: 'Public' });
        fetchDashboardData();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleQuickAddTask = async () => {
    try {
      const res = await API.post('/tasks', newTask);
      if (res.data.success) {
        alert('Task created!');
        setShowQuickAdd(false);
        setNewTask({ title: '', deadline: '', priority: 'Low' });
        fetchDashboardData();
      }
    } catch (err) {
      alert('Failed to create task');
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

  const handlePostAnnouncement = async () => {
  if (!newAnnouncement.title || !newAnnouncement.content) { alert('Title and content required'); return; }
  try {
    const res = await API.post('/user/announcements', newAnnouncement);
    if (res.data.success) {
      alert('Announcement posted!');
      setShowAnnouncement(false);
      setNewAnnouncement({ title: '', content: '' });
    }
  } catch (err) {
    alert('Failed to post announcement');
  }
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
          {label:'Dashboard',  path:'/dashboard'},
          {label:'Calendar',   path:'/calendar'},
          {label:'Requests',   path:'/requests'},
          {label:'Documents',  path:'/documents'},
          {label:'Visitors',   path:'/visitors'},
          {label:'Tasks',      path:'/tasks'},
          {label:'Reports',    path:'/reports'},
          {label:'Settings',   path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(i===0 ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>{initials}</div>
          <div style={{flex:1}}>
            <div style={styles.userName}>{name}</div>
            <div style={styles.userRole}>{role}</div>
          </div>
          <div style={styles.logoutBtn} onClick={handleLogout}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal - LNMIIT</div>
            <div style={styles.topbarSub}>{today}</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>
              🔔 {notifications.length > 0 ? `(${notifications.length})` : ''}
            </div>
            <button style={styles.quickAddBtn} onClick={() => setShowQuickAdd(!showQuickAdd)}>
              + Quick Add
            </button>
            <button style={{...styles.quickAddBtn, background:'#0EA5E9'}} onClick={() => setShowAnnouncement(!showAnnouncement)}>
  📢 Announce
</button>
            <div style={styles.rolePill}>👤 {role} ▾</div>
          </div>
        </div>

        {/* QUICK ADD PANEL */}
        {showQuickAdd && (
          <div style={styles.quickAddPanel}>
            <div style={styles.quickAddTabs}>
              <div style={{...styles.quickTab, ...(quickAddType==='event' ? styles.quickTabActive : {})}} onClick={() => setQuickAddType('event')}>+ Event</div>
              <div style={{...styles.quickTab, ...(quickAddType==='task' ? styles.quickTabActive : {})}} onClick={() => setQuickAddType('task')}>+ Task</div>
            </div>
            {quickAddType === 'event' ? (
              <div style={styles.quickForm}>
                <input style={styles.quickInput} placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                <input style={styles.quickInput} type="datetime-local" value={newEvent.start_time} onChange={e => setNewEvent({...newEvent, start_time: e.target.value})} />
                <input style={styles.quickInput} type="datetime-local" value={newEvent.end_time} onChange={e => setNewEvent({...newEvent, end_time: e.target.value})} />
                <select style={styles.quickInput} value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                  <option>Public</option>
                  <option>Internal</option>
                  <option>Confidential</option>
                </select>
                <button style={styles.quickSaveBtn} onClick={handleQuickAddEvent}>Save Event</button>
              </div>
            ) : (
              <div style={styles.quickForm}>
                <input style={styles.quickInput} placeholder="Task title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                <input style={styles.quickInput} type="date" value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} />
                <select style={styles.quickInput} value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <button style={styles.quickSaveBtn} onClick={handleQuickAddTask}>Save Task</button>
              </div>
            )}
          </div>
        )}

        {showAnnouncement && (
  <div style={styles.quickAddPanel}>
    <div style={styles.quickForm}>
      <input style={styles.quickInput} placeholder="Announcement title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
      <input style={styles.quickInput} placeholder="Content" value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} />
      <button style={styles.quickSaveBtn} onClick={handlePostAnnouncement}>Post</button>
      <button style={{...styles.quickSaveBtn, background:'#64748B'}} onClick={() => setShowAnnouncement(false)}>Cancel</button>
    </div>
  </div>
)}

        <div style={styles.content}>
          {/* GREETING */}
          <div style={styles.greeting}>
            Good morning, <span style={{color:'#2563EB', fontWeight:'700'}}>{name}</span>
            &nbsp;|&nbsp; Have a productive day!
          </div>

          {/* STAT CARDS */}
          <div style={styles.statGrid}>
            {[
              {icon:'✉️', num: stats.requests,  label:'Pending Requests', bg:'#EFF6FF'},
              {icon:'📅', num: stats.meetings,  label:"Today's Meetings",  bg:'#EFF6FF'},
              {icon:'✅', num: stats.tasks,     label:'Active Tasks',      bg:'#FFFBEB'},
              {icon:'👥', num: stats.visitors,  label:'Visitors Today',    bg:'#F0FDF4'},
            ].map((s,i) => (
              <div key={i} style={styles.statCard}>
                <div style={{...styles.statIcon, background:s.bg}}>{s.icon}</div>
                <div>
                  <div style={styles.statNum}>{s.num}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* TOP ROW - 3 COLUMNS */}
          <div style={styles.threeCol}>

            {/* TODAY'S SCHEDULE */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📅 Today's Schedule</span>
                <span style={styles.viewAll} onClick={() => navigate('/calendar')}>View all →</span>
              </div>
              {schedule.length === 0 ? (
                <div style={styles.emptyMsg}>No events today</div>
              ) : schedule.map((ev, i) => {
                const s = getEventTypeStyle(ev.type);
                const time = new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                return (
                  <div key={i} style={styles.schItem}>
                    <span style={styles.schTime}>{time}</span>
                    <div style={{...styles.dot, background: s.dot}}></div>
                    <div style={{flex:1}}>
                      <div style={styles.schTitle}>{ev.title}</div>
                      <div style={styles.schStatus}>
                        <span style={{...styles.tag, background: s.tagBg, color: s.tagColor}}>{ev.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PENDING REQUESTS */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📋 Pending Requests</span>
                <span style={styles.viewAll} onClick={() => navigate('/requests')}>View all →</span>
              </div>
              {requests.length === 0 ? (
                <div style={styles.emptyMsg}>No pending requests</div>
              ) : requests.map((r, i) => {
                const s = getPriorityStyle(r.priority);
                return (
                  <div key={i} style={styles.reqItem}>
                    <div style={{flex:1}}>
                      <div style={styles.reqId}>#{r.id.slice(0,8)}</div>
                      <div style={styles.reqName}>{r.purpose ? r.purpose.slice(0, 25) + '...' : 'No purpose'}</div>
                      <span style={{...styles.tag, background: s.priBg, color: s.priColor}}>{r.priority}</span>
                    </div>
                    <div style={styles.reqBtns}>
                                         </div>
                  </div>
                );
              })}
            </div>

            {/* ALERTS */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>🚨 Alerts</span>
              </div>
              {alerts.length === 0 ? (
                <div style={styles.emptyMsg}>No upcoming alerts</div>
              ) : alerts.map((a, i) => (
                <div key={i} style={{...styles.alertItem, background: a.bg, border:`1px solid ${a.border}`}}>
                  <span style={{fontSize:'16px'}}>{a.ic}</span>
                  <div>
                    <div style={styles.alertTitle}>{a.title}</div>
                    <div style={styles.alertBody}>{a.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TASKS SUMMARY */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>✅ Tasks Summary</span>
              <span style={styles.viewAll} onClick={() => navigate('/tasks')}>View board →</span>
            </div>
            <div style={styles.taskSummary}>
              {[
                {label:'Pending',     num: tasks.pending,    bg:'#FEF3C7', color:'#92400E'},
                {label:'In Progress', num: tasks.inProgress, bg:'#DBEAFE', color:'#1E40AF'},
                {label:'Completed',   num: tasks.completed,  bg:'#DCFCE7', color:'#166534'},
              ].map((t, i) => (
                <div key={i} style={{...styles.taskSummaryCard, background: t.bg}}>
                  <div style={{...styles.taskSummaryNum, color: t.color}}>{t.num}</div>
                  <div style={styles.taskSummaryLabel}>{t.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:             { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA', overflow:'hidden' },
  sidebar:          { width:'168px', background:'#122951', display:'flex', flexDirection:'column', flexShrink:0 },
  sidebarLogo:      { padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'10px' },
  logoRow:          { display:'flex', gap:'6px', marginBottom:'8px' },
  badge:            { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  logoTitle:        { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:          { color:'rgba(255,255,255,0.4)', fontSize:'9px' },
  navItem:          { display:'flex', alignItems:'center', padding:'9px 16px', margin:'1px 8px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:'500' },
  navActive:        { background:'rgba(37,99,235,0.35)', color:'#fff' },
  sidebarFooter:    { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'8px' },
  avatar:           { width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  userName:         { color:'#fff', fontSize:'11px', fontWeight:'600' },
  userRole:         { color:'rgba(255,255,255,0.45)', fontSize:'9px' },
  logoutBtn:        { color:'rgba(255,255,255,0.5)', fontSize:'16px', cursor:'pointer', padding:'4px' },
  main:             { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:           { background:'#1A3A6B', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  topbarTitle:      { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:        { color:'rgba(255,255,255,0.5)', fontSize:'10px', marginTop:'1px' },
  topbarRight:      { display:'flex', alignItems:'center', gap:'10px' },
  notifBtn:         { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 10px', color:'#fff', fontSize:'14px', cursor:'pointer' },
  quickAddBtn:      { background:'#2563EB', color:'#fff', border:'none', borderRadius:'8px', padding:'6px 14px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  rolePill:         { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  quickAddPanel:    { background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'12px 22px', display:'flex', alignItems:'center', gap:'16px', flexShrink:0 },
  quickAddTabs:     { display:'flex', gap:'8px' },
  quickTab:         { padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer', background:'#F8FAFC', border:'1px solid #E2E8F0' },
  quickTabActive:   { background:'#1A3A6B', color:'#fff', border:'1px solid #1A3A6B' },
  quickForm:        { display:'flex', alignItems:'center', gap:'8px', flex:1 },
  quickInput:       { border:'1px solid #E2E8F0', borderRadius:'8px', padding:'7px 12px', fontSize:'11px', outline:'none', flex:1 },
  quickSaveBtn:     { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'7px 16px', fontSize:'11px', fontWeight:'700', cursor:'pointer', flexShrink:0 },
  content:          { flex:1, overflowY:'auto', padding:'18px 22px' },
  greeting:         { fontSize:'13px', color:'#475569', marginBottom:'16px' },
  statGrid:         { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' },
  statCard:         { background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  statIcon:         { width:'42px', height:'42px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 },
  statNum:          { fontSize:'22px', fontWeight:'700', color:'#1E293B', lineHeight:1 },
  statLabel:        { fontSize:'10px', color:'#64748B', marginTop:'3px', fontWeight:'500' },
  threeCol:         { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'14px' },
  card:             { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'12px' },
  cardHeader:       { padding:'13px 16px 10px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle:        { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  viewAll:          { fontSize:'10px', color:'#2563EB', fontWeight:'600', cursor:'pointer' },
  schItem:          { display:'flex', alignItems:'flex-start', gap:'10px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC' },
  schTime:          { fontSize:'10px', color:'#94A3B8', width:'36px', flexShrink:0, fontFamily:'monospace', marginTop:'2px' },
  dot:              { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0, marginTop:'4px' },
  schTitle:         { fontSize:'11px', fontWeight:'600', color:'#1E293B', marginBottom:'3px' },
  schStatus:        { display:'flex', gap:'4px' },
  tag:              { fontSize:'8px', fontWeight:'600', padding:'3px 8px', borderRadius:'10px', flexShrink:0 },
  reqItem:          { display:'flex', alignItems:'center', gap:'10px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC' },
  reqId:            { fontSize:'9px', color:'#94A3B8', marginBottom:'2px' },
  reqName:          { fontSize:'11px', fontWeight:'600', color:'#1E293B', marginBottom:'3px' },
  reqBtns:          { display:'flex', gap:'4px', flexShrink:0 },
  approveBtn:       { background:'#DCFCE7', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'6px', padding:'4px 8px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  rejectBtn:        { background:'#FEE2E2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:'6px', padding:'4px 8px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  alertItem:        { display:'flex', alignItems:'flex-start', gap:'10px', padding:'10px 12px', borderRadius:'9px', margin:'8px' },
  alertTitle:       { fontSize:'11px', fontWeight:'700', color:'#1E293B', marginBottom:'2px' },
  alertBody:        { fontSize:'9px', color:'#64748B', lineHeight:1.4 },
  taskSummary:      { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', padding:'14px 16px' },
  taskSummaryCard:  { borderRadius:'10px', padding:'14px', textAlign:'center' },
  taskSummaryNum:   { fontSize:'28px', fontWeight:'700', lineHeight:1, marginBottom:'4px' },
  taskSummaryLabel: { fontSize:'11px', color:'#64748B', fontWeight:'500' },
  emptyMsg:         { padding:'16px', fontSize:'11px', color:'#94A3B8', textAlign:'center' },
};

export default SecretaryDashboard;