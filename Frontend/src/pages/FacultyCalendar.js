import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function FacultyCalendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1));
  const [selectedDay, setSelectedDay] = useState(25);

  // Faculty only sees PUBLIC events
  const events = {
    15: [{ title:'Faculty Senate Meeting',   tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF', time:'14:00', dot:'#2563EB' }],
    25: [
          { title:'Faculty Senate Meeting',   tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF', time:'14:00', dot:'#2563EB' },
          { title:'Industry Visitor — TCS',   tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF', time:'16:30', dot:'#10B981' },
        ],
    28: [{ title:'Campus Recruitment Drive', tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF', time:'09:00', dot:'#2563EB' }],
    30: [{ title:'End of Month Review',      tag:'Public', tagBg:'#DBEAFE', tagColor:'#1E40AF', time:'11:00', dot:'#2563EB' }],
  };

  const monthName = currentMonth.toLocaleString('default', { month:'long', year:'numeric' });
  const firstDay  = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

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
          {label:'Dashboard',   path:'/faculty-requests'},
          {label:'My Requests', path:'/faculty-requests'},
          {label:'Calendar',    path:'/faculty-calendar'},
          {label:'My Tasks',    path:'/tasks'},
          {label:'Settings',    path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(item.path === window.location.pathname ? styles.navActive : {})}}
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
          <div style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>↩</div>
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

          {/* HEADER */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📅 Calendar</div>
              <div style={styles.pageSub}>Viewing public events only</div>
            </div>
            <div style={styles.publicNote}>
              👁 You can only see Public events
            </div>
          </div>

          <div style={styles.calendarLayout}>

            {/* LEFT — CALENDAR */}
            <div style={styles.calCard}>
              <div style={styles.monthNav}>
                <button style={styles.navBtn} onClick={prevMonth}>←</button>
                <span style={styles.monthName}>{monthName}</span>
                <button style={styles.navBtn} onClick={nextMonth}>→</button>
              </div>

              <div style={styles.dayHeaders}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} style={styles.dayHeader}>{d}</div>
                ))}
              </div>

              <div style={styles.daysGrid}>
                {days.map((day, i) => (
                  <div key={i}
                    style={{
                      ...styles.dayCell,
                      ...(day === null ? styles.dayCellEmpty : {}),
                      ...(events[day] ? styles.dayCellHasEvent : {}),
                      ...(day === selectedDay ? {
                        border:`2px solid ${events[day] ? events[day][0].tagColor : '#1A3A6B'}`,
                        background: events[day] ? events[day][0].tagBg : '#EFF6FF',
                      } : {}),
                    }}
                    onClick={() => day && setSelectedDay(day)}
                  >
                    {day && (
                      <>
                        <span style={{ fontSize:'13px', fontWeight:'700', color:'#1E293B', zIndex:2, position:'relative' }}>{day}</span>
                        {events[day] && (
                          <div style={{position:'absolute', left:0, top:0, bottom:0, width:'4px', borderRadius:'10px 0 0 10px', background:events[day][0].tagColor}}></div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendDot, background:'#1E40AF'}}></div>
                  <span style={{...styles.legendLabel, background:'#DBEAFE', color:'#1E40AF'}}>Public</span>
                </div>
                <div style={{fontSize:'10px', color:'#94A3B8', marginLeft:'auto'}}>
                  Confidential & Internal events are hidden
                </div>
              </div>
            </div>

            {/* RIGHT — EVENTS */}
            <div style={styles.eventsPanel}>
              <div style={styles.eventsPanelTitle}>
                📋 Events for May {selectedDay}, 2026
              </div>

              {events[selectedDay] ? (
                events[selectedDay].map((ev, i) => (
                  <div key={i} style={styles.eventCard}>
                    <div style={styles.eventCardLeft}>
                      <div style={styles.eventTime}>{ev.time}</div>
                      <div style={styles.eventBar}></div>
                    </div>
                    <div style={styles.eventCardRight}>
                      <div style={styles.eventTitle}>{ev.title}</div>
                      <span style={{...styles.eventTag, background:ev.tagBg, color:ev.tagColor}}>{ev.tag}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.noEvents}>No public events for this day</div>
              )}

              {/* UPCOMING */}
              <div style={styles.upcomingTitle}>🔔 Upcoming Public Events</div>
              {[
                {day:'28 May', title:'Campus Recruitment Drive', time:'09:00 AM'},
                {day:'30 May', title:'End of Month Review',      time:'11:00 AM'},
              ].map((u,i) => (
                <div key={i} style={styles.upcomingItem}>
                  <div style={styles.upcomingDay}>{u.day}</div>
                  <div style={{flex:1}}>
                    <div style={styles.upcomingName}>{u.title}</div>
                    <div style={styles.upcomingTime}>{u.time}</div>
                  </div>
                  <span style={{...styles.eventTag, background:'#DBEAFE', color:'#1E40AF'}}>Public</span>
                </div>
              ))}

              {/* INFO BOX */}
              <div style={styles.infoBox}>
                ℹ️ Only Public events are visible to Faculty. Confidential and Internal events are managed by the Director's Office.
              </div>
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
  rolePill:         { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  content:          { flex:1, overflowY:'auto', padding:'18px 22px' },
  pageHeader:       { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  pageTitle:        { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:          { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  publicNote:       { background:'#DBEAFE', color:'#1E40AF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'7px 14px', fontSize:'11px', fontWeight:'600' },
  calendarLayout:   { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  calCard:          { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  monthNav:         { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  navBtn:           { background:'#EFF6FF', border:'none', borderRadius:'6px', padding:'6px 12px', fontSize:'14px', cursor:'pointer', color:'#1A3A6B', fontWeight:'700' },
  monthName:        { fontSize:'14px', fontWeight:'700', color:'#1E293B' },
  dayHeaders:       { display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'6px' },
  dayHeader:        { textAlign:'center', fontSize:'10px', fontWeight:'600', color:'#94A3B8', padding:'4px 0' },
  daysGrid:         { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' },
  dayCell:          { height:'52px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:'10px', cursor:'pointer', position:'relative', padding:'4px', border:'1px solid transparent' },
  dayCellEmpty:     { cursor:'default' },
  dayCellHasEvent:  { background:'#EFF6FF', border:'1px solid #BFDBFE' },
  legend:           { display:'flex', alignItems:'center', gap:'10px', marginTop:'14px', paddingTop:'12px', borderTop:'1px solid #F1F5F9' },
  legendItem:       { display:'flex', alignItems:'center', gap:'5px' },
  legendDot:        { width:'6px', height:'6px', borderRadius:'50%' },
  legendLabel:      { fontSize:'9px', fontWeight:'600', padding:'2px 7px', borderRadius:'10px' },
  eventsPanel:      { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflowY:'auto' },
  eventsPanelTitle: { fontSize:'12px', fontWeight:'700', color:'#1E293B', marginBottom:'12px', paddingBottom:'10px', borderBottom:'1px solid #F1F5F9' },
  eventCard:        { display:'flex', gap:'10px', marginBottom:'10px', padding:'10px', background:'#F8FAFC', borderRadius:'8px', border:'1px solid #E2E8F0' },
  eventCardLeft:    { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
  eventTime:        { fontSize:'10px', fontWeight:'600', color:'#1A3A6B', fontFamily:'monospace' },
  eventBar:         { flex:1, width:'2px', background:'#BFDBFE', borderRadius:'1px' },
  eventCardRight:   { flex:1 },
  eventTitle:       { fontSize:'11px', fontWeight:'600', color:'#1E293B', marginBottom:'5px' },
  eventTag:         { fontSize:'8px', fontWeight:'600', padding:'2px 8px', borderRadius:'10px' },
  noEvents:         { fontSize:'11px', color:'#94A3B8', textAlign:'center', padding:'20px 0' },
  upcomingTitle:    { fontSize:'11px', fontWeight:'700', color:'#1E293B', margin:'16px 0 10px', paddingTop:'12px', borderTop:'1px solid #F1F5F9' },
  upcomingItem:     { display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #F8FAFC' },
  upcomingDay:      { fontSize:'10px', fontWeight:'600', color:'#2563EB', width:'50px', flexShrink:0, fontFamily:'monospace' },
  upcomingName:     { fontSize:'11px', fontWeight:'500', color:'#1E293B' },
  upcomingTime:     { fontSize:'9px', color:'#94A3B8' },
  infoBox:          { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#1E40AF', marginTop:'14px', lineHeight:1.5 },
};

export default FacultyCalendar;