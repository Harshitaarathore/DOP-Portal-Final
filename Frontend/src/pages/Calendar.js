import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import { useNotifCount } from '../hooks/useNotifCount';

function Calendar() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [newEvent, setNewEvent] = useState({ title: '', description: '', start_time: '', end_time: '', type: 'Public', visibility: 'public', notes: '' });
  const [addError, setAddError] = useState('');
  const [hoveredNav, setHoveredNav] = useState(null);
  const { count: notifCount } = useNotifCount();

  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ start_time: '', end_time: '' });
  const [rescheduleError, setRescheduleError] = useState('');

  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const canManage = role === 'Secretary' || role === 'Director';

  // Any non-managing role (Staff, Faculty, etc.) is a restricted viewer
  const isRestrictedViewer = !canManage;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => { fetchEvents(); if (role !== 'Staff') fetchTasks(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get(role === 'Staff' ? '/events/public' : '/events/full');
      if (res.data.success) setEvents(res.data.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      if (res.data.success) {
        const all = [
          ...(res.data.data['Pending'] || []),
          ...(res.data.data['In Progress'] || []),
          ...(res.data.data['Completed'] || []),
        ];
        setTasks(all);
      }
    } catch (err) { console.log(err); }
  };

  const handleAddEvent = async () => {
    setAddError('');
    if (!newEvent.title.trim()) { setAddError('Event title is required'); return; }
    if (!newEvent.start_time) { setAddError('Start time is required'); return; }
    if (!newEvent.end_time) { setAddError('End time is required'); return; }
    if (newEvent.start_time >= newEvent.end_time) { setAddError('End time must be after start time'); return; }
    try {
      const res = await API.post('/events', newEvent);
      if (res.data.success) {
        setShowAddForm(false);
        setNewEvent({ title: '', description: '', start_time: '', end_time: '', type: 'Public', visibility: 'public', notes: '' });
        fetchEvents();
      } else { setAddError(res.data.message); }
    } catch { setAddError('Failed to create event'); }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await API.delete(`/events/${id}`);
      if (res.data.success) fetchEvents();
    } catch { alert('Failed to delete'); }
  };

  // Helper: extract HH:mm from a datetime string (ISO or "YYYY-MM-DD HH:mm:ss")
  const getTime = (val) => {
    if (!val) return '';
    return val.includes('T') ? val.split('T')[1].slice(0, 5) : val.split(' ')[1]?.slice(0, 5) ?? '';
  };

  // Helper: format time range "HH:mm – HH:mm"
  const getTimeRange = (start, end) => {
    const s = getTime(start);
    const e = getTime(end);
    if (!s) return '';
    if (!e) return s;
    return `${s} – ${e}`;
  };

  const toLocalInputValue = (val) => {
    if (!val) return '';
    const d = new Date(val.includes('T') ? val : val.replace(' ', 'T'));
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openReschedule = (ev) => {
    setReschedulingId(ev.id);
    setRescheduleError('');
    setRescheduleForm({
      start_time: toLocalInputValue(ev.start_time),
      end_time: toLocalInputValue(ev.end_time),
    });
  };

  const cancelReschedule = () => {
    setReschedulingId(null);
    setRescheduleError('');
    setRescheduleForm({ start_time: '', end_time: '' });
  };

  const submitReschedule = async (ev) => {
    setRescheduleError('');
    if (!rescheduleForm.start_time || !rescheduleForm.end_time) {
      setRescheduleError('Both start and end time are required');
      return;
    }
    if (rescheduleForm.start_time >= rescheduleForm.end_time) {
      setRescheduleError('End time must be after start time');
      return;
    }
    try {
      const res = await API.put(`/events/${ev.id}`, {
        ...ev,
        start_time: rescheduleForm.start_time,
        end_time: rescheduleForm.end_time,
      });
      if (res.data.success) {
        cancelReschedule();
        fetchEvents();
      } else {
        setRescheduleError(res.data.message || 'Failed to reschedule');
      }
    } catch {
      setRescheduleError('Failed to reschedule');
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const getEventStyle = (type) => {
    if (type === 'Confidential') return { dot: '#EF4444', tagBg: '#FEE2E2', tagColor: '#991B1B', bar: '#EF4444' };
    if (type === 'Internal') return { dot: '#F59E0B', tagBg: '#FEF3C7', tagColor: '#92400E', bar: '#F59E0B' };
    return { dot: '#22C55E', tagBg: '#DCFCE7', tagColor: '#166534', bar: '#22C55E' };
  };

  // Style used for "Busy" blocks shown to restricted viewers
  const busyStyle = { tagBg: '#F1F5F9', tagColor: '#475569' };

  const taskStyle = { dot: '#8B5CF6', tagBg: '#EDE9FE', tagColor: '#5B21B6', bar: '#8B5CF6' };

  // Calendar helpers
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const eventsByDay = {};
  events.forEach(ev => {
    const d = new Date(ev.start_time).getDate();
    const m = new Date(ev.start_time).getMonth();
    if (m === currentMonth.getMonth()) {
      if (!eventsByDay[d]) eventsByDay[d] = [];
      eventsByDay[d].push(ev);
    }
  });

  const tasksByDay = {};
  tasks.forEach(t => {
    if (!t.deadline) return;
    const d = new Date(t.deadline).getDate();
    const m = new Date(t.deadline).getMonth();
    if (m === currentMonth.getMonth()) {
      if (!tasksByDay[d]) tasksByDay[d] = [];
      tasksByDay[d].push(t);
    }
  });

  const selectedDayEvents = eventsByDay[selectedDay] || [];
  const selectedDayTasks = tasksByDay[selectedDay] || [];
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const upcoming = events
    .filter(ev => new Date(ev.start_time) > todayEnd)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5);

  const upcomingTasks = tasks
    .filter(t => t.deadline && new Date(t.deadline) > todayEnd && t.status !== 'Completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  const getWeekDays = () => {
    const tod = new Date();
    tod.setDate(tod.getDate() + weekOffset * 7);
    const start = new Date(tod);
    start.setDate(tod.getDate() - tod.getDay());
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  };
  const weekDays = getWeekDays();

  const allItems = [
    ...events.map(e => ({ ...e, itemType: 'event', sortDate: new Date(e.start_time) })),
    ...(role !== 'Staff' ? tasks.filter(t => t.deadline).map(t => ({ ...t, itemType: 'task', sortDate: new Date(t.deadline) })) : []),
  ].sort((a, b) => a.sortDate - b.sortDate);

  const navItems = role === 'Staff' ? [
  { label: 'Dashboard', path: '/staff-portal?tab=dashboard', icon: '🏠' },
  { label: 'Request Meeting', path: '/staff-portal?tab=request', icon: '📋' },
  { label: 'My Requests', path: '/staff-portal?tab=myrequests', icon: '📌' },
  { label: 'Calendar', path: '/calendar', icon: '📅' },
  { label: 'Documents', path: '/staff-portal?tab=documents', icon: '📁' },
  { label: 'Visitor Request', path: '/staff-portal?tab=visitor', icon: '👥' },
  { label: 'Announcements', path: '/staff-portal?tab=announcements', icon: '📢' },
  { label: 'Settings', path: '/staff-portal?tab=settings', icon: '⚙️' },
] : role === 'Faculty' ? [
  { label: 'Dashboard', path: '/faculty-requests', icon: '🏠' },
  { label: 'My Requests', path: '/faculty-requests', icon: '📋' },
  { label: 'Calendar', path: '/faculty-calendar', icon: '📅' },
  { label: 'Tasks', path: '/tasks', icon: '✅' },
  { label: 'Documents', path: '/documents', icon: '📁' },
  { label: 'Announcements', path: '/announcements', icon: '📢' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
] : role === 'Director' ? [
  { label: 'Dashboard', path: '/director-dashboard', icon: '🏠' },
  { label: 'Requests', path: '/director-approvals', icon: '📋' },
  { label: 'Calendar', path: '/calendar', icon: '📅' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
] : [
  // Secretary's full sidebar
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Calendar', path: '/calendar', icon: '📅' },
  { label: 'Requests', path: '/requests', icon: '📋' },
  { label: 'Documents', path: '/documents', icon: '📁' },
  { label: 'Visitors', path: '/visitors', icon: '👥' },
  { label: 'Communication', path: '/communications', icon: '💬' },
  { label: 'Tasks', path: '/tasks', icon: '✅' },
  { label: 'Announcements', path: '/announcements', icon: '📢' },
  { label: 'Reports', path: '/reports', icon: '📊' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
];

  // Inline reschedule form — only rendered for canManage users
  const RescheduleForm = ({ ev }) => (
    <div style={S.rescheduleBox} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <input
          style={{ ...S.input, flex: 1, minWidth: '160px' }}
          type="datetime-local"
          value={rescheduleForm.start_time}
          onChange={e => setRescheduleForm({ ...rescheduleForm, start_time: e.target.value })}
        />
        <input
          style={{ ...S.input, flex: 1, minWidth: '160px' }}
          type="datetime-local"
          value={rescheduleForm.end_time}
          onChange={e => setRescheduleForm({ ...rescheduleForm, end_time: e.target.value })}
        />
      </div>
      {rescheduleError && <div style={{ ...S.errorMsg, marginTop: '6px' }}>⚠️ {rescheduleError}</div>}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        <button style={S.editBtn} onClick={() => submitReschedule(ev)}>✅ Confirm</button>
        <button style={S.deleteBtn} onClick={cancelReschedule}>✖ Cancel</button>
      </div>
    </div>
  );

  return (
    <div style={S.page} className="page-transition">

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logoWrap}>
          <img src={lnmiitLogo} alt="LNMIIT" style={S.logo} />
        </div>
        <div style={S.portalBanner}>
          <div style={S.portalName}>Director's Office Portal</div>
          <div style={S.portalDate}>{today}</div>
        </div>
        <div style={S.divider} />
        {navItems.map((item, i) => (
          <div key={i}
            style={{ ...S.navItem, ...(item.path === window.location.pathname ? S.navActive : {}), ...(hoveredNav === i && item.path !== window.location.pathname ? { background: '#F8FAFC', color: '#1A3A6B' } : {}) }}
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
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>🔔
              {notifCount > 0 && <span style={S.notifBadge}>{notifCount}</span>}
            </div>
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>📅 Calendar</div>
              <div style={S.pageSub}>Manage meetings, events and task deadlines</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={S.viewToggle}>
                {['month', 'week', 'list'].map(v => (
                  <div key={v}
                    style={{ ...S.viewBtn, ...(viewMode === v ? S.viewBtnActive : {}) }}
                    onClick={() => setViewMode(v)}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </div>
                ))}
              </div>
              {canManage && (
                <button style={S.addBtn} onClick={() => setShowAddForm(!showAddForm)}>+ Add Event</button>
              )}
            </div>
          </div>

          {/* ADD EVENT FORM */}
          {showAddForm && (
            <div style={S.addForm}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input style={{ ...S.input, flex: 2 }} placeholder="Event title *" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                <input style={{ ...S.input, flex: 2 }} placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                <select style={{ ...S.input, flex: 1 }} value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}>
                  <option>Public</option><option>Internal</option><option>Confidential</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input style={{ ...S.input, flex: 1 }} type="datetime-local" min="2000-01-01T00:00" max="2099-12-31T23:59" value={newEvent.start_time} onChange={e => setNewEvent({ ...newEvent, start_time: e.target.value })} />
                <input style={{ ...S.input, flex: 1 }} type="datetime-local" min="2000-01-01T00:00" max="2099-12-31T23:59" value={newEvent.end_time} onChange={e => setNewEvent({ ...newEvent, end_time: e.target.value })} />
                {canManage && <input style={{ ...S.input, flex: 2 }} placeholder="Notes (private)" value={newEvent.notes} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })} />}
              </div>
              {addError && <div style={S.errorMsg}>⚠️ {addError}</div>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={S.addBtn} onClick={handleAddEvent}>Save Event</button>
                <button style={{ ...S.addBtn, background: '#64748B' }} onClick={() => { setShowAddForm(false); setAddError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* ───────────────────── MONTH VIEW ───────────────────── */}
          {viewMode === 'month' && (
            <div style={S.calLayout}>

              {/* CALENDAR GRID */}
              <div style={S.calCard}>
                <div style={S.monthNav}>
                  <button style={S.navBtn} onClick={prevMonth}>←</button>
                  <span style={S.monthName}>{monthName}</span>
                  <button style={S.navBtn} onClick={nextMonth}>→</button>
                </div>

                <div style={S.dayHeaders}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} style={S.dayHeader}>{d}</div>
                  ))}
                </div>

                <div style={S.daysGrid}>
                  {days.map((day, i) => {
                    const dayEvs = eventsByDay[day] || [];
                    const dayTsks = tasksByDay[day] || [];
                    const isSelected = day === selectedDay;
                    const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
                    return (
                      <div key={i}
                        style={{
                          ...S.dayCell,
                          ...(day === null ? S.dayCellEmpty : {}),
                          ...(isToday ? { background: '#EFF6FF', border: '2px solid #2563EB' } : {}),
                          ...(isSelected && !isToday ? { background: '#F8FAFC', border: '2px solid #1A3A6B' } : {}),
                        }}
                        onClick={() => day && setSelectedDay(day)}
                      >
                        {day && (
                          <>
                            <span style={{ fontSize: '11px', fontWeight: isToday ? '800' : '600', color: isToday ? '#2563EB' : '#1E293B' }}>{day}</span>
                            <div style={{ width: '100%', padding: '0 2px', marginTop: '2px' }}>
                              {dayEvs.slice(0, 2).map((ev, j) => {
                                const isNonPublic = ev.type !== 'Public';
                                const showBusy = isRestrictedViewer && isNonPublic;
                                const s = showBusy ? busyStyle : getEventStyle(ev.type);
                                const timeRange = getTimeRange(ev.start_time, ev.end_time);
                                return (
                                  <div key={j} style={{ background: s.tagBg, color: s.tagColor, fontSize: '7px', fontWeight: '600', borderRadius: '3px', padding: '1px 3px', marginBottom: '1px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {showBusy ? `🔒 Busy ${timeRange}` : `${timeRange} ${ev.title}`}
                                  </div>
                                );
                              })}
                              {role !== 'Staff' && dayTsks.slice(0, 1).map((t, j) => (
                                <div key={j} style={{ background: '#EDE9FE', color: '#5B21B6', fontSize: '7px', fontWeight: '600', borderRadius: '3px', padding: '1px 3px', marginBottom: '1px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                  📌 {t.title}
                                </div>
                              ))}
                              {(dayEvs.length + dayTsks.length) > 3 && (
                                <div style={{ fontSize: '7px', color: '#94A3B8', textAlign: 'center' }}>+{dayEvs.length + dayTsks.length - 3} more</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* LEGEND — only for Secretary/Director */}
                {canManage && (
                  <div style={S.legend}>
                    {[
                      { label: 'Confidential', bg: '#FEE2E2', color: '#991B1B' },
                      { label: 'Internal', bg: '#FEF3C7', color: '#92400E' },
                      { label: 'Public', bg: '#DCFCE7', color: '#166534' },
                      { label: 'Task', bg: '#EDE9FE', color: '#5B21B6' },
                    ].map((l, i) => (
                      <div key={i} style={S.legendItem}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.bg, border: `1px solid ${l.color}`, flexShrink: 0 }} />
                        <span style={{ fontSize: '9px', color: '#64748B' }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT PANEL */}
              <div style={S.eventsPanel}>
                <div style={S.panelTitle}>
                  {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDay}, {currentMonth.getFullYear()}
                </div>

                {selectedDayEvents.map((ev, i) => {
                  const s = getEventStyle(ev.type);
                  const isHidden = role === 'Staff' && ev.type !== 'Public';
                  const startTime = ev.start_time?.includes('T') ? ev.start_time.split('T')[1].slice(0, 5) : ev.start_time?.split(' ')[1]?.slice(0, 5);
                  const endTime = ev.end_time?.includes('T') ? ev.end_time.split('T')[1].slice(0, 5) : ev.end_time?.split(' ')[1]?.slice(0, 5);
                  return (
                    <div key={i} style={S.upcomingItem}>
                      <div style={{ fontSize: '10px', color: '#2563EB', fontWeight: '600', width: '80px', flexShrink: 0 }}>
                        {startTime}{endTime ? ` – ${endTime}` : ''}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: '#1E293B', flex: 1 }}>
                        {isHidden ? 'Busy' : ev.title}
                      </div>
                      {!isHidden && role !== 'Staff' && <span style={{ ...S.tag, background: s.tagBg, color: s.tagColor }}>{ev.type}</span>}
                      {canManage && !isHidden && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button style={S.editBtn} onClick={() => { const t = prompt('Edit title:', ev.title); if (t) API.put(`/events/${ev.id}`, { ...ev, title: t }).then(fetchEvents); }}>✏️</button>
                        <button style={S.deleteBtn} onClick={() => handleDeleteEvent(ev.id)}>🗑</button>
                      </div>
                      )}
                    </div>
                  );
                })}

                {role !== 'Staff' && selectedDayTasks.length > 0 && (
                  <>
                    <div style={{ ...S.sectionLabel, background: '#EDE9FE', color: '#5B21B6' }}>📌 Task Deadlines</div>
                    {selectedDayTasks.map((t, i) => (
                      <div key={i} style={S.upcomingItem}>
                        <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '600', width: '80px', flexShrink: 0 }}>Deadline</div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: '#1E293B', flex: 1 }}>{t.title}</div>
                        <span style={{ ...S.tag, background: '#EDE9FE', color: '#5B21B6' }}>{t.status}</span>
                      </div>
                    ))}
                  </>
                )}

                {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 && (
                  <div style={S.empty}>No events or tasks for this day</div>
                )}

                <div style={S.upcomingTitle}>🔔 Upcoming Events</div>
                {upcoming.length === 0 ? <div style={S.empty}>No upcoming events</div> : upcoming.map((u, i) => {
                  const isNonPublic = u.type !== 'Public';
                  const showBusy = isRestrictedViewer && isNonPublic;
                  const s = showBusy ? busyStyle : getEventStyle(u.type);
                  const timeRange = getTimeRange(u.start_time, u.end_time);
                  return (
                    <div key={i} style={S.upcomingItem}>
                      <div style={{ fontSize: '10px', color: showBusy ? '#64748B' : '#2563EB', fontWeight: '600', width: '80px', flexShrink: 0 }}>
                        {new Date(u.start_time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        {timeRange && <div style={{ fontWeight: '500', color: '#94A3B8' }}>{timeRange}</div>}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '500', color: '#1E293B', flex: 1 }}>
                        {showBusy ? '🔒 Busy' : u.title}
                      </div>
                      {!showBusy && <span style={{ ...S.tag, background: s.tagBg, color: s.tagColor }}>{u.type}</span>}
                    </div>
                  );
                })}

                {role !== 'Staff' && (
                  <>
                    <div style={{ ...S.upcomingTitle, color: '#5B21B6' }}>📌 Upcoming Deadlines</div>
                    {upcomingTasks.length === 0 ? <div style={S.empty}>No upcoming deadlines</div> : upcomingTasks.map((t, i) => (
                      <div key={i} style={S.upcomingItem}>
                        <div style={{ fontSize: '10px', color: '#8B5CF6', fontWeight: '600', width: '80px', flexShrink: 0 }}>
                          {new Date(t.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: '#1E293B', flex: 1 }}>{t.title}</div>
                        <span style={{ ...S.tag, background: '#EDE9FE', color: '#5B21B6' }}>{t.status}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ───────────────────── WEEK VIEW ───────────────────── */}
          {viewMode === 'week' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={S.calCard}>
                <div style={S.monthNav}>
                  <button style={S.navBtn} onClick={() => setWeekOffset(weekOffset - 1)}>←</button>
                  <span style={S.monthName}>
                    {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button style={S.navBtn} onClick={() => setWeekOffset(weekOffset + 1)}>→</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '6px' }}>
                  {weekDays.map((wd, i) => {
                    const d = wd.getDate(), m = wd.getMonth();
                    const isToday = wd.toDateString() === new Date().toDateString();
                    const isSelected = d === selectedDay && m === currentMonth.getMonth();
                    const dayEvs = events.filter(ev => { const ed = new Date(ev.start_time); return ed.getDate() === d && ed.getMonth() === m; });
                    const dayTsk = tasks.filter(t => { if (!t.deadline) return false; const td = new Date(t.deadline); return td.getDate() === d && td.getMonth() === m; });
                    return (
                      <div key={i}
                        style={{
                          background: isToday ? '#EFF6FF' : isSelected ? '#F8FAFC' : '#fff',
                          border: isToday ? '2px solid #2563EB' : isSelected ? '2px solid #1A3A6B' : '1px solid #E2E8F0',
                          borderRadius: '10px', padding: '8px', minHeight: '120px', cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => { setSelectedDay(d); setCurrentMonth(new Date(wd.getFullYear(), m, 1)); }}
                      >
                        <div style={{ fontSize: '10px', fontWeight: '700', color: isToday ? '#2563EB' : isSelected ? '#1A3A6B' : '#1E293B', marginBottom: '6px', textAlign: 'center' }}>
                          {wd.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                          <span style={{ fontSize: '15px' }}>{d}</span>
                        </div>
                        {dayEvs.map((ev, j) => {
                          const isNonPublic = ev.type !== 'Public';
                          const showBusy = isRestrictedViewer && isNonPublic;
                          const s = showBusy ? busyStyle : getEventStyle(ev.type);
                          const timeRange = getTimeRange(ev.start_time, ev.end_time);
                          return (
                            <div key={j} style={{ background: s.tagBg, color: s.tagColor, borderRadius: '3px', padding: '2px 4px', fontSize: '8px', marginBottom: '3px', fontWeight: '600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                              {showBusy ? `🔒 Busy ${timeRange}` : `${timeRange} ${ev.title}`}
                            </div>
                          );
                        })}
                        {role !== 'Staff' && dayTsk.map((t, j) => (
                          <div key={j} style={{ background: '#EDE9FE', color: '#5B21B6', borderRadius: '3px', padding: '2px 4px', fontSize: '8px', marginBottom: '3px', fontWeight: '600', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>📌 {t.title}</div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WEEK DETAIL PANEL */}
              <div style={{ ...S.calCard, padding: '14px' }}>
                <div style={S.panelTitle}>
                  {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDay}, {currentMonth.getFullYear()}
                </div>
                {(eventsByDay[selectedDay] || []).length === 0 && (tasksByDay[selectedDay] || []).length === 0 ? (
                  <div style={S.empty}>No events or tasks for this day</div>
                ) : (
                  <>
                    {(eventsByDay[selectedDay] || []).map((ev, i) => {
                      const isNonPublic = ev.type !== 'Public';
                      const showBusy = isRestrictedViewer && isNonPublic;
                      const s = showBusy ? busyStyle : getEventStyle(ev.type);
                      const timeRange = getTimeRange(ev.start_time, ev.end_time);
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={S.upcomingItem}>
                            <div style={{ fontSize: '10px', color: showBusy ? '#64748B' : '#2563EB', fontWeight: '600', width: '80px', flexShrink: 0 }}>
                              {timeRange}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '500', color: '#1E293B', flex: 1 }}>
                              {showBusy ? '🔒 Busy' : ev.title}
                            </div>
                            {!showBusy && <span style={{ ...S.tag, background: s.tagBg, color: s.tagColor }}>{ev.type}</span>}
                            {canManage && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button style={S.editBtn} onClick={() => { const t = prompt('Edit title:', ev.title); if (t) API.put(`/events/${ev.id}`, { ...ev, title: t }).then(fetchEvents); }}>✏️</button>
                                <button style={S.editBtn} onClick={() => openReschedule(ev)}>📅</button>
                                <button style={S.deleteBtn} onClick={() => handleDeleteEvent(ev.id)}>🗑</button>
                              </div>
                            )}
                          </div>
                          {canManage && reschedulingId === ev.id && <RescheduleForm ev={ev} />}
                        </div>
                      );
                    })}
                    {role !== 'Staff' && (tasksByDay[selectedDay] || []).map((t, i) => (
                      <div key={i} style={S.upcomingItem}>
                        <div style={{ fontSize: '10px', color: '#8B5CF6', fontWeight: '600', width: '80px', flexShrink: 0 }}>Deadline</div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: '#1E293B', flex: 1 }}>{t.title}</div>
                        <span style={{ ...S.tag, background: '#EDE9FE', color: '#5B21B6' }}>{t.status}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ───────────────────── LIST VIEW ───────────────────── */}
          {viewMode === 'list' && (
            <div style={S.calCard}>
              <div style={S.monthNav}>
                <span style={S.monthName}>All Events & Task Deadlines</span>
              </div>
              {loading ? <div style={S.empty}>Loading...</div> : allItems.length === 0 ? <div style={S.empty}>No events or tasks found</div> : allItems.map((item, i) => {
                const isTask = item.itemType === 'task';
                const isNonPublic = !isTask && item.type !== 'Public';
                const showBusy = isRestrictedViewer && isNonPublic;
                const s = isTask ? taskStyle : (showBusy ? busyStyle : getEventStyle(item.type));
                const dateStr = isTask
                  ? new Date(item.deadline).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
                  : new Date(item.start_time).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = isTask ? 'Deadline' : getTimeRange(item.start_time, item.end_time);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #F1F5F9', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px' }}>
                      <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', width: '80px', flexShrink: 0 }}>{dateStr}</div>
                      <div style={{ fontSize: '10px', color: isTask ? '#8B5CF6' : (showBusy ? '#64748B' : '#1A3A6B'), fontFamily: 'monospace', fontWeight: '700', width: '90px', flexShrink: 0 }}>{timeStr}</div>
                      <div style={{ flex: 1, fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>
                        {isTask ? '📌 ' : (showBusy ? '🔒 ' : '🗓 ')}
                        {showBusy ? 'Busy' : item.title}
                      </div>
                      {/* Tag: hidden for restricted viewers on non-public events */}
                      {!showBusy && (
                        <span style={{ ...S.tag, background: s.tagBg, color: s.tagColor }}>
                          {isTask ? (item.status || 'Pending') : item.type}
                        </span>
                      )}
                      {/* Reschedule / delete — only for canManage, only for events */}
                      {!isTask && canManage && (
                        <>
                          <button style={{ ...S.editBtn, padding: '6px 14px', fontSize: '12px' }} onClick={() => openReschedule(item)}>📅 Reschedule</button>
                          <button style={{ ...S.deleteBtn, padding: '6px 14px', fontSize: '12px' }} onClick={() => handleDeleteEvent(item.id)}>🗑 Delete</button>
                        </>
                      )}
                    </div>
                    {!isTask && canManage && reschedulingId === item.id && (
                      <div style={{ padding: '0 14px 10px' }}>
                        <RescheduleForm ev={item} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#F5F7FA', overflow: 'hidden' },
  logoWrap: { padding: '14px 16px 12px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' },
  logo: { width: '130px', objectFit: 'contain' },
  portalBanner: { padding: '14px 16px' },
  portalName: { color: '#1A3A6B', fontSize: '13px', fontWeight: '700', lineHeight: 1.4, marginBottom: '6px', fontFamily: "'DM Sans',sans-serif" },
  portalDate: { color: '#64748B', fontSize: '11px', fontWeight: '500', fontFamily: "'DM Sans',sans-serif" },
  sidebar: { width: '200px', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto', borderRight: '1px solid #E2E8F0', boxShadow: '1px 0 4px rgba(0,0,0,0.06)' },
  divider: { height: '1px', background: '#E2E8F0', margin: '4px 0' },
  navItem: { padding: '10px 16px', cursor: 'pointer', fontSize: '12px', color: '#475569', fontWeight: '500', borderLeft: '3px solid transparent', transition: 'all 0.2s ease', userSelect: 'none' },
  navActive: { background: '#EFF6FF', color: '#1A3A6B', borderLeft: '3px solid #2563EB', fontWeight: '700' },
  navIcon: { fontSize: '14px', marginRight: '8px', flexShrink: 0 },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#fff', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser: { display: 'flex', alignItems: 'center', gap: '10px' },
  topbarAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  topbarUserName: { color: '#1A3A6B', fontSize: '13px', fontWeight: '700' },
  topbarUserEmail: { color: '#94A3B8', fontSize: '9px' },
  topbarUserRole: { color: '#64748B', fontSize: '10px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  notifBadge: { position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: '#fff', borderRadius: '50%', width: '14px', height: '14px', fontSize: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifWrap: { position: 'relative', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '6px 10px', color: '#1A3A6B', fontSize: '14px', cursor: 'pointer' },
  btnLogout: { background: '#DC2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  content: { flex: 1, overflowY: 'auto', padding: '16px 20px' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  pageTitle: { fontSize: '16px', fontWeight: '700', color: '#1E293B' },
  pageSub: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
  viewToggle: { display: 'flex', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', padding: '3px', gap: '3px' },
  viewBtn: { padding: '7px 18px', fontSize: '12px', fontWeight: '600', color: '#64748B', cursor: 'pointer', borderRadius: '6px' },
  viewBtnActive: { background: '#1A3A6B', color: '#fff', borderRadius: '6px' },
  addBtn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  addForm: { background: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px 12px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none', fontFamily: "'DM Sans',sans-serif" },
  errorMsg: { color: '#DC2626', fontSize: '11px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '4px', padding: '6px 10px' },
  calLayout: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '14px' },
  calCard: { background: '#fff', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  monthNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' },
  navBtn: { background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 12px', fontSize: '13px', cursor: 'pointer', color: '#1A3A6B', fontWeight: '700' },
  monthName: { fontSize: '14px', fontWeight: '700', color: '#1E293B' },
  dayHeaders: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: '4px' },
  dayHeader: { textAlign: 'center', fontSize: '10px', fontWeight: '600', color: '#94A3B8', padding: '4px 0' },
  daysGrid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '3px' },
  dayCell: { minHeight: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 2px', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.15s ease' },
  dayCellEmpty: { cursor: 'default' },
  legend: { display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '4px' },
  eventsPanel: { background: '#fff', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' },
  panelTitle: { fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' },
  sectionLabel: { display: 'inline-block', fontSize: '10px', fontWeight: '700', color: '#1E40AF', background: '#DBEAFE', padding: '3px 10px', borderRadius: '6px', marginBottom: '8px' },
  tag: { fontSize: '10px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px' },
  editBtn: { background: '#DBEAFE', color: '#1E40AF', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '10px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '10px', cursor: 'pointer', fontWeight: '600' },
  empty: { fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '16px 0' },
  upcomingTitle: { fontSize: '11px', fontWeight: '700', color: '#1E293B', margin: '14px 0 8px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' },
  upcomingItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: '1px solid #F8FAFC' },
  rescheduleBox: { background: '#F8FAFC', border: '1px dashed #94A3B8', borderRadius: '8px', padding: '8px 10px', marginBottom: '8px' },
};

export default Calendar;


