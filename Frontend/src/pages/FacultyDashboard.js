import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FacultyDashboard() {
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState('Meeting Request');
  const [requestDesc, setRequestDesc] = useState('');

  const myRequests = [
    { id:1, type:'Meeting Request',  date:'24 May 2026', status:'Pending',  priority:'High'   },
    { id:2, type:'Leave Approval',   date:'20 May 2026', status:'Approved', priority:'Medium' },
    { id:3, type:'Research Fund',    date:'15 May 2026', status:'Rejected', priority:'Low'    },
  ];

  const myTasks = [
    { title:'Submit NAAC Documents',    due:'25 May', status:'In Progress', prog:55 },
    { title:'Upload Research Report',   due:'28 May', status:'Pending',     prog:0  },
    { title:'Faculty Meeting Minutes',  due:'23 May', status:'Completed',   prog:100},
  ];

  const stBg    = { Pending:'#FEF3C7', Approved:'#DCFCE7', Rejected:'#FEE2E2' };
  const stColor = { Pending:'#92400E', Approved:'#166534', Rejected:'#991B1B' };
  const priBg   = { High:'#FEE2E2', Medium:'#DBEAFE', Low:'#DCFCE7' };
  const priColor= { High:'#991B1B', Medium:'#1E40AF', Low:'#166634' };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    alert('Request submitted successfully! You will be notified via email.');
    setShowRequestForm(false);
    setRequestDesc('');
  };

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
          {label:'Dashboard',    path:'/faculty-dashboard'},
          {label:'My Requests',  path:'/faculty-requests'},
          {label:'Calendar',     path:'/faculty-calendar'},
          {label:'My Tasks',     path:'/tasks'},
          {label:'Settings',     path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(i===0 ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>FA</div>
          <div style={{flex:1}}>
            <div style={styles.userName}>Faculty</div>
            <div style={styles.userRole}>LNMIIT</div>
          </div>
          <div style={styles.logoutBtn} onClick={handleLogout}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.topbarSub}>Faculty View</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 Faculty ▾</div>
          </div>
        </div>

        <div style={styles.content}>

          {/* GREETING */}
          <div style={styles.greeting}>
            Good morning, <span style={{color:'#2563EB', fontWeight:'700'}}>Faculty</span>
            &nbsp;— Saturday, 24 May 2026
          </div>

          {/* STAT CARDS */}
          <div style={styles.statGrid}>
            {[
              {icon:'📋', num:'3',  label:'My Requests',    bg:'#EFF6FF', color:'#1A3A6B'},
              {icon:'✅', num:'3',  label:'My Tasks',        bg:'#FFFBEB', color:'#92400E'},
              {icon:'📅', num:'2',  label:'Upcoming Events', bg:'#F0FDF4', color:'#166534'},
              {icon:'🔔', num:'1',  label:'Notifications',   bg:'#FEE2E2', color:'#991B1B'},
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

          {/* SUBMIT REQUEST BUTTON */}
          <div style={styles.submitRow}>
            <button
              style={styles.submitBtn}
              onClick={() => setShowRequestForm(!showRequestForm)}
            >
              {showRequestForm ? '✕ Cancel' : '+ Submit New Request to Director'}
            </button>
          </div>

          {/* REQUEST FORM */}
          {showRequestForm && (
            <div style={styles.requestForm}>
              <div style={styles.formTitle}>📋 New Request to Director</div>
              <form onSubmit={handleSubmitRequest}>
                <label style={styles.label}>Request Type</label>
                <select
                  style={styles.select}
                  value={requestType}
                  onChange={e => setRequestType(e.target.value)}
                >
                  {['Meeting Request','Leave Approval','Research Fund','Document Sign','Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <label style={styles.label}>Priority</label>
                <select style={styles.select}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe your request in detail..."
                  value={requestDesc}
                  onChange={e => setRequestDesc(e.target.value)}
                  required
                  rows={4}
                />

                <div style={styles.formBtns}>
                  <button style={styles.submitFormBtn} type="submit">Submit Request →</button>
                  <button style={styles.cancelBtn} type="button" onClick={() => setShowRequestForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div style={styles.midRow}>

            {/* MY REQUESTS */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>📋 My Requests</span>
              </div>
              {myRequests.map((req,i) => (
                <div key={i} style={styles.reqItem}>
                  <div style={{flex:1}}>
                    <div style={styles.reqName}>{req.type}</div>
                    <div style={styles.reqDate}>📅 {req.date}</div>
                  </div>
                  <span style={{...styles.tag, background:priBg[req.priority], color:priColor[req.priority], marginRight:'6px'}}>{req.priority}</span>
                  <span style={{...styles.tag, background:stBg[req.status], color:stColor[req.status]}}>{req.status}</span>
                </div>
              ))}
            </div>

            {/* MY TASKS */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>✅ My Tasks</span>
              </div>
              {myTasks.map((task,i) => (
                <div key={i} style={styles.taskItem}>
                  <div style={{flex:1}}>
                    <div style={styles.taskName}>{task.title}</div>
                    <div style={styles.taskDue}>Due: {task.due}</div>
                    <div style={styles.progBar}>
                      <div style={{
                        ...styles.progFill,
                        width:`${task.prog}%`,
                        background: task.prog === 100 ? '#10B981' : '#2563EB'
                      }}></div>
                    </div>
                  </div>
                  <span style={{...styles.tag, background:stBg[task.status], color:stColor[task.status], marginLeft:'10px'}}>{task.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PUBLIC EVENTS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>📅 Upcoming Public Events</span>
              <span style={styles.viewAll} onClick={() => navigate('/faculty-calendar')}>View calendar →</span>
            </div>
            {[
              {time:'14:00', title:'Faculty Senate Meeting',  date:'24 May', tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF'},
              {time:'09:00', title:'Campus Recruitment Drive', date:'28 May', tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF'},
            ].map((ev,i) => (
              <div key={i} style={styles.schItem}>
                <span style={styles.schTime}>{ev.date}</span>
                <div style={{...styles.dot, background:'#2563EB'}}></div>
                <span style={styles.schTitle}>{ev.title} · {ev.time}</span>
                <span style={{...styles.tag, background:ev.tagBg, color:ev.tagColor}}>{ev.tag}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page:           { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA', overflow:'hidden' },
  sidebar:        { width:'168px', background:'#122951', display:'flex', flexDirection:'column', flexShrink:0 },
  sidebarLogo:    { padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'10px' },
  logoRow:        { display:'flex', gap:'6px', marginBottom:'8px' },
  badge:          { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  logoTitle:      { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:        { color:'rgba(255,255,255,0.4)', fontSize:'9px' },
  navItem:        { display:'flex', alignItems:'center', padding:'9px 16px', margin:'1px 8px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:'500' },
  navActive:      { background:'rgba(37,99,235,0.35)', color:'#fff' },
  sidebarFooter:  { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'8px' },
  avatar:         { width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  userName:       { color:'#fff', fontSize:'11px', fontWeight:'600' },
  userRole:       { color:'rgba(255,255,255,0.45)', fontSize:'9px' },
  logoutBtn:      { color:'rgba(255,255,255,0.5)', fontSize:'16px', cursor:'pointer', padding:'4px' },
  main:           { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:         { background:'#1A3A6B', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  topbarTitle:    { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:      { color:'rgba(255,255,255,0.5)', fontSize:'10px', marginTop:'1px' },
  topbarRight:    { display:'flex', alignItems:'center', gap:'10px' },
  notifBtn:       { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 10px', color:'#fff', fontSize:'14px', cursor:'pointer' },
  rolePill:       { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  content:        { flex:1, overflowY:'auto', padding:'18px 22px' },
  greeting:       { fontSize:'13px', color:'#475569', marginBottom:'16px' },
  statGrid:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' },
  statCard:       { background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  statIcon:       { width:'42px', height:'42px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 },
  statNum:        { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', marginTop:'3px', fontWeight:'500' },
  submitRow:      { marginBottom:'12px' },
  submitBtn:      { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  requestForm:    { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  formTitle:      { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #F1F5F9' },
  label:          { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px', marginTop:'12px' },
  select:         { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  textarea:       { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:"'DM Sans',sans-serif" },
  formBtns:       { display:'flex', gap:'10px', marginTop:'16px' },
  submitFormBtn:  { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'10px 20px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  cancelBtn:      { background:'#fff', color:'#64748B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 20px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  midRow:         { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' },
  card:           { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden', marginBottom:'12px' },
  cardHeader:     { padding:'13px 16px 10px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle:      { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  viewAll:        { fontSize:'10px', color:'#2563EB', fontWeight:'600', cursor:'pointer' },
  reqItem:        { display:'flex', alignItems:'center', gap:'10px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC' },
  reqName:        { fontSize:'11px', fontWeight:'600', color:'#1E293B' },
  reqDate:        { fontSize:'9px', color:'#94A3B8', marginTop:'2px' },
  tag:            { fontSize:'8px', fontWeight:'600', padding:'3px 8px', borderRadius:'10px', flexShrink:0 },
  taskItem:       { display:'flex', alignItems:'center', gap:'10px', padding:'9px 16px', borderBottom:'1px solid #F8FAFC' },
  taskName:       { fontSize:'11px', fontWeight:'600', color:'#1E293B' },
  taskDue:        { fontSize:'9px', color:'#94A3B8', marginTop:'2px' },
  progBar:        { width:'100%', height:'4px', background:'#E2E8F0', borderRadius:'2px', marginTop:'6px' },
  progFill:       { height:'100%', borderRadius:'2px' },
  schItem:        { display:'flex', alignItems:'center', gap:'10px', padding:'8px 16px', borderBottom:'1px solid #F8FAFC' },
  schTime:        { fontSize:'10px', color:'#94A3B8', width:'42px', flexShrink:0, fontFamily:'monospace' },
  dot:            { width:'8px', height:'8px', borderRadius:'50%', flexShrink:0 },
  schTitle:       { fontSize:'11px', fontWeight:'600', color:'#1E293B', flex:1 },
};

export default FacultyDashboard;