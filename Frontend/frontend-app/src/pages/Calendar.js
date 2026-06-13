import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Calendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', start_time: '', end_time: '', type: 'Public', visibility: 'public', notes: '' });
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      let res;
      if (role === 'Staff') {
        res = await API.get('/events/public');
      } else {
        res = await API.get('/events/full');
      }
      if (res.data.success) setEvents(res.data.data);
    } catch (err) {
      console.log('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    try {
      const res = await API.post('/events', newEvent);
      if (res.data.success) {
        alert('Event created!');
        setShowAddForm(false);
        setNewEvent({ title: '', description: '', start_time: '', end_time: '', type: 'Public', visibility: 'public', notes: '' });
        fetchEvents();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data.success) fetchEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // group events by day
  const eventsByDay = {};
  events.forEach(ev => {
    const d = new Date(ev.start_time).getDate();
    const m = new Date(ev.start_time).getMonth();
    if (m === currentMonth.getMonth()) {
      if (!eventsByDay[d]) eventsByDay[d] = [];
      eventsByDay[d].push(ev);
    }
  });

  const selectedDayEvents = eventsByDay[selectedDay] || [];

  const getTypeStyle = (type) => {
    if (type === 'Confidential') return { tagBg: '#FEE2E2', tagColor: '#991B1B' };
    if (type === 'Internal') return { tagBg: '#FEF3C7', tagColor: '#92400E' };
    return { tagBg: '#DBEAFE', tagColor: '#1E40AF' };
  };

  // upcoming events (future dates)
  const today = new Date();
  const upcoming = events
    .filter(ev => new Date(ev.start_time) > today)
    .slice(0, 3);

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
            style={{...styles.navItem, ...(item.path === window.location.pathname ? styles.navActive : {})}}
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
              <div style={styles.pageTitle}>📅 Calendar</div>
              <div style={styles.pageSub}>Manage meetings, events and schedules</div>
            </div>
            {(role === 'Secretary' || role === 'Director') && (
              <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>+ Add Event</button>
            )}
          </div>

          {/* ADD EVENT FORM */}
          {showAddForm && (
            <div style={styles.addForm}>
              <input style={styles.input} placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <input style={styles.input} placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
              <input style={styles.input} type="datetime-local" value={newEvent.start_time} onChange={e => setNewEvent({...newEvent, start_time: e.target.value})} />
              <input style={styles.input} type="datetime-local" value={newEvent.end_time} onChange={e => setNewEvent({...newEvent, end_time: e.target.value})} />
              <select style={styles.input} value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value})}>
                <option>Public</option>
                <option>Internal</option>
                <option>Confidential</option>
              </select>
              {role !== 'Staff' && (
                <input style={styles.input} placeholder="Notes (secret)" value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} />
              )}
              <div style={{display:'flex', gap:'10px'}}>
                <button style={styles.addBtn} onClick={handleAddEvent}>Save Event</button>
                <button style={{...styles.addBtn, background:'#64748B'}} onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={styles.calendarLayout}>
            {/* LEFT - CALENDAR GRID */}
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
                {days.map((day, i) => {
                  const hasEvent = eventsByDay[day];
                  const isSelected = day === selectedDay;
                  const typeStyle = hasEvent ? getTypeStyle(hasEvent[0].type) : {};
                  return (
                    <div key={i}
                      style={{
                        ...styles.dayCell,
                        ...(isSelected ? { border: `2px solid #1A3A6B`, background: '#EFF6FF' } : {}),
                        ...(day === null ? styles.dayCellEmpty : {}),
                        ...(hasEvent && !isSelected ? { background: typeStyle.tagBg, border: `1px solid ${typeStyle.tagColor}20` } : {}),
                      }}
                      onClick={() => day && setSelectedDay(day)}
                    >
                      {day && (
                        <>
                        <span style={{ fontSize:'13px', fontWeight:'700', color:'#1E293B' }}>{day}</span>
                        {hasEvent && (<div style={{ width:'6px', height:'6px', borderRadius:'50%', background: typeStyle.tagColor, marginTop:'2px' }}></div>)}
                        {hasEvent && role === 'Staff' && (<div style={{fontSize:'7px', color:'#64748B', marginTop:'1px'}}>Busy</div>)}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={styles.legend}>
                {[
                  {label:'Confidential', color:'#991B1B', bg:'#FEE2E2'},
                  {label:'Internal',     color:'#92400E', bg:'#FEF3C7'},
                  {label:'Public',       color:'#1E40AF', bg:'#DBEAFE'},
                ].map((l,i) => (
                  <div key={i} style={styles.legendItem}>
                    <div style={{...styles.legendDot, background:l.color}}></div>
                    <span style={{...styles.legendLabel, background:l.bg, color:l.color}}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT - SELECTED DAY EVENTS */}
            <div style={styles.eventsPanel}>
              <div style={styles.eventsPanelTitle}>
                📋 Events for {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDay}
              </div>

              {loading ? (
                <div style={styles.noEvents}>Loading...</div>
              ) : selectedDayEvents.length === 0 ? (
                <div style={styles.noEvents}>No events for this day</div>
              ) :  selectedDayEvents.map((ev, i) => {
                      const s = getTypeStyle(ev.type);
                      const time = new Date(ev.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                      return (
                        <div key={i} style={styles.eventCard}>
                          <div style={styles.eventCardLeft}>
                            <div style={styles.eventTime}>{time}</div>
                            <div style={styles.eventBar}></div> 
                          </div>
                          <div style={styles.eventCardRight}>
                            <div style={styles.eventTitle}>{role === 'Staff' ? 'Busy' : ev.title}</div>
                            <span style={{...styles.eventTag, background: s.tagBg, color: s.tagColor}}>{ev.type}</span>
                            {role !== 'Staff' && ev.notes && (
                              <div style={{fontSize:'10px', color:'#64748B', marginTop:'4px'}}>📝 {ev.notes}</div>)}
                            {role !== 'Staff' && ev.description && (<div style={{fontSize:'10px', color:'#64748B', marginTop:'4px'}}>📄 {ev.description}</div>)}
                            {(role === 'Secretary' || role === 'Director') && (
                              <div style={{display:'flex', gap:'6px', marginTop:'6px'}}>
                                <button style={styles.editEvBtn} onClick={() => {
                                  const newTitle = prompt('Edit title:', ev.title);
                                  if (newTitle) {
                                  API.put(`/events/${ev.id}`, {...ev, title: newTitle})
                                  .then(() => fetchEvents())
                                  .catch(() => alert('Failed to edit'));
                                  }}}>✏️ Edit</button>
                                  <button style={styles.deleteEvBtn} onClick={() => handleDeleteEvent(ev.id)}>🗑 Delete</button>
                              </div>
                              )}
                          </div>
                        </div>);})}

              {/* UPCOMING */}
              <div style={styles.upcomingTitle}>🔔 Upcoming Events</div>
              {upcoming.length === 0 ? (
                <div style={styles.noEvents}>No upcoming events</div>
              ) : upcoming.map((u, i) => {
                const s = getTypeStyle(u.type);
                return (
                  <div key={i} style={styles.upcomingItem}>
                    <div style={styles.upcomingDay}>{new Date(u.start_time).toLocaleDateString('en-US', { day:'numeric', month:'short' })}</div>
                    <div style={styles.upcomingName}>{u.title}</div>
                    <span style={{...styles.eventTag, background: s.tagBg, color: s.tagColor}}>{u.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:              { display:'flex', height:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA', overflow:'hidden' },
  sidebar:           { width:'168px', background:'#122951', display:'flex', flexDirection:'column', flexShrink:0 },
  sidebarLogo:       { padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:'10px' },
  logoRow:           { display:'flex', gap:'6px', marginBottom:'8px' },
  badge:             { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  logoTitle:         { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:           { color:'rgba(255,255,255,0.4)', fontSize:'9px' },
  navItem:           { display:'flex', alignItems:'center', padding:'9px 16px', margin:'1px 8px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:'500' },
  navActive:         { background:'rgba(37,99,235,0.35)', color:'#fff' },
  sidebarFooter:     { marginTop:'auto', padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'8px' },
  avatar:            { width:'30px', height:'30px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  userName:          { color:'#fff', fontSize:'11px', fontWeight:'600' },
  userRole:          { color:'rgba(255,255,255,0.45)', fontSize:'9px' },
  main:              { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:            { background:'#1A3A6B', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  topbarTitle:       { color:'#fff', fontSize:'14px', fontWeight:'700' },
  topbarSub:         { color:'rgba(255,255,255,0.5)', fontSize:'10px', marginTop:'1px' },
  topbarRight:       { display:'flex', alignItems:'center', gap:'10px' },
  notifBtn:          { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 10px', color:'#fff', fontSize:'14px', cursor:'pointer' },
  rolePill:          { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600', cursor:'pointer' },
  content:           { flex:1, overflowY:'auto', padding:'18px 22px' },
  pageHeader:        { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' },
  pageTitle:         { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:           { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:            { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  addForm:           { background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'10px' },
  input:             { padding:'9px 12px', borderRadius:'8px', border:'1px solid #E2E8F0', fontSize:'12px', outline:'none' },
  calendarLayout:    { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  calCard:           { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  monthNav:          { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  navBtn:            { background:'#EFF6FF', border:'none', borderRadius:'6px', padding:'6px 12px', fontSize:'14px', cursor:'pointer', color:'#1A3A6B', fontWeight:'700' },
  monthName:         { fontSize:'14px', fontWeight:'700', color:'#1E293B' },
  dayHeaders:        { display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:'6px' },
  dayHeader:         { textAlign:'center', fontSize:'10px', fontWeight:'600', color:'#94A3B8', padding:'4px 0' },
  daysGrid:          { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' },
  dayCell:           { height:'52px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', borderRadius:'10px', cursor:'pointer', position:'relative', border:'1px solid transparent' },
  dayCellEmpty:      { cursor:'default' },
  legend:            { display:'flex', gap:'10px', marginTop:'14px', paddingTop:'12px', borderTop:'1px solid #F1F5F9' },
  legendItem:        { display:'flex', alignItems:'center', gap:'5px' },
  legendDot:         { width:'6px', height:'6px', borderRadius:'50%' },
  legendLabel:       { fontSize:'9px', fontWeight:'600', padding:'2px 7px', borderRadius:'10px' },
  eventsPanel:       { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflowY:'auto' },
  eventsPanelTitle:  { fontSize:'12px', fontWeight:'700', color:'#1E293B', marginBottom:'12px', paddingBottom:'10px', borderBottom:'1px solid #F1F5F9' },
  eventCard:         { display:'flex', gap:'10px', marginBottom:'10px', padding:'10px', background:'#F8FAFC', borderRadius:'8px', border:'1px solid #E2E8F0' },
  eventCardLeft:     { display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' },
  eventTime:         { fontSize:'10px', fontWeight:'600', color:'#1A3A6B', fontFamily:'monospace' },
  eventBar:          { flex:1, width:'2px', background:'#BFDBFE', borderRadius:'1px' },
  eventCardRight:    { flex:1 },
  eventTitle:        { fontSize:'11px', fontWeight:'600', color:'#1E293B', marginBottom:'5px' },
  eventTag:          { fontSize:'8px', fontWeight:'600', padding:'2px 8px', borderRadius:'10px' },
  deleteEvBtn:       { background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'9px', cursor:'pointer', marginTop:'6px' },
  noEvents:          { fontSize:'11px', color:'#94A3B8', textAlign:'center', padding:'20px 0' },
  upcomingTitle:     { fontSize:'11px', fontWeight:'700', color:'#1E293B', margin:'16px 0 10px', paddingTop:'12px', borderTop:'1px solid #F1F5F9' },
  upcomingItem:      { display:'flex', alignItems:'center', gap:'10px', padding:'8px 0', borderBottom:'1px solid #F8FAFC' },
  upcomingDay:       { fontSize:'10px', fontWeight:'600', color:'#2563EB', width:'50px', flexShrink:0, fontFamily:'monospace' },
  upcomingName:      { fontSize:'11px', fontWeight:'500', color:'#1E293B', flex:1 },
  editEvBtn: { background:'#DBEAFE', color:'#1E40AF', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'9px', cursor:'pointer' },
};

export default Calendar;