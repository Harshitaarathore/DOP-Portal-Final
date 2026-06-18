import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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

function Tasks() {
  const navigate = useNavigate();
  const [kanban, setKanban] = useState({ Pending:[], 'In Progress':[], Completed:[] });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title:'', description:'', assigned_to:'', deadline:'', priority:'Low' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [users, setUsers] = useState([]);
  const { count: notifCount, refresh: refreshNotif } = useNotifCount();

  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const canManage = role === 'Secretary' || role === 'Director';
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const navItems = [
    { label:'Dashboard',     path:'/dashboard',      icon:'🏠' },
    { label:'Calendar',      path:'/calendar',       icon:'📅' },
    { label:'Requests',      path:'/requests',       icon:'📋' },
    { label:'Documents',     path:'/documents',      icon:'📁' },
    { label:'Visitors',      path:'/visitors',       icon:'👥' },
    { label:'Communication', path:'/communications', icon:'💬' },
    { label:'Tasks',         path:'/tasks',          icon:'✅' },
    { label:'Announcements', path:'/announcements',  icon:'📢' },
    { label:'Reports',       path:'/reports',        icon:'📊' },
    { label:'Settings',      path:'/settings',       icon:'⚙️' },
  ];
  
  useEffect(() => { fetchTasks(); fetchUsers(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      if (res.data.success) setKanban(res.data.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/user');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {console.log('Error fetching users:', err);}
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (!canManage) return;

    const newStatus = destination.droppableId;
    const newKanban = { ...kanban };
    const sourceList = [...newKanban[source.droppableId]];
    const destList = source.droppableId === destination.droppableId ? sourceList : [...newKanban[destination.droppableId]];
    const [moved] = sourceList.splice(source.index, 1);
    moved.status = newStatus;
    destList.splice(destination.index, 0, moved);
    newKanban[source.droppableId] = sourceList;
    newKanban[destination.droppableId] = destList;
    setKanban(newKanban);

    try {
      await API.put(`/tasks/${draggableId}/status`, { status: newStatus });
      refreshNotif();
      if (newStatus === 'Completed') showToast(`Task moved to Completed!`, 'success');
    } catch {
      showToast('Failed to update task status', 'error');
      fetchTasks();
    }
  };

const handleAddTask = async () => {
  setFormError('');
  if (!newTask.title.trim()) { setFormError('Task title is required'); return; }
  if (!newTask.deadline) { setFormError('Deadline is required'); return; }
  const today = new Date(); today.setHours(0,0,0,0);
  if (new Date(newTask.deadline) < today) { setFormError('Deadline cannot be in the past'); return; }

  setSubmitting(true);
  try {
    if (newTask.assigned_to === '__all__') {
      // Create one task per user
      const results = await Promise.all(
        users.map(u => API.post('/tasks', { ...newTask, assigned_to: u.id }))
      );
      const allOk = results.every(r => r.data.success);
      if (allOk) {
        showToast(`Task assigned to all ${users.length} users!`, 'success');
        setShowAddForm(false);
        setNewTask({ title:'', description:'', assigned_to:'', deadline:'', priority:'Low' });
        fetchTasks();
      } else { setFormError('Some assignments failed'); }
    } else {
      const res = await API.post('/tasks', newTask);
      if (res.data.success) {
        showToast('Task created successfully!', 'success');
        setShowAddForm(false);
        setNewTask({ title:'', description:'', assigned_to:'', deadline:'', priority:'Low' });
        fetchTasks();
      } else { setFormError(res.data.message); }
    }
  } catch { setFormError('Failed to create task'); }
  finally { setSubmitting(false); }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await API.delete(`/tasks/${id}`);
      if (res.data.success) { fetchTasks(); showToast('Task deleted', 'success'); }
      else showToast(res.data.message, 'error');
    } catch { showToast('Failed to delete task', 'error'); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const priBg    = { High:'#FEE2E2', Medium:'#DBEAFE', Low:'#DCFCE7' };
  const priColor = { High:'#991B1B', Medium:'#1E40AF', Low:'#166534' };
  const colConfig = {
    Pending:     { bg:'#FFFBEB', header:'#FEF3C7', color:'#92400E', icon:'⏳', border:'#FDE68A' },
    'In Progress':{ bg:'#EFF6FF', header:'#DBEAFE', color:'#1E40AF', icon:'🔄', border:'#BFDBFE' },
    Completed:   { bg:'#F0FDF4', header:'#DCFCE7', color:'#166534', icon:'✅', border:'#86EFAC' },
  };

  const allTasks = [...kanban.Pending, ...kanban['In Progress'], ...kanban.Completed];

  const isOverdue = (deadline) => deadline && new Date(deadline) < new Date() ;

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
            onMouseEnter={() => setHoveredNav(i)} onMouseLeave={() => setHoveredNav(null)}
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
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>✅ Tasks — Kanban Board</div>
              <div style={S.pageSub}>Drag and drop tasks to update status</div>
            </div>
            {canManage && (
              <button style={S.addBtn} onClick={() => { setShowAddForm(!showAddForm); setFormError(''); }}>
                + Add Task
              </button>
            )}
          </div>

          {/* ADD FORM */}
          {showAddForm && canManage && (
            <div style={S.addForm}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 1fr 1fr', gap:'8px' }}>
                <input style={S.input} placeholder="Task title *" value={newTask.title} onChange={e => setNewTask({...newTask, title:e.target.value})} />
                <input style={S.input} placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description:e.target.value})} />
                <select style={S.input} value={newTask.priority} onChange={e => setNewTask({...newTask, priority:e.target.value})}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input style={S.input} type="date" value={newTask.deadline} min={new Date().toISOString().split('T')[0]} onChange={e => setNewTask({...newTask, deadline:e.target.value})} placeholder="Deadline *" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <select style={S.input} value={newTask.assigned_to} onChange={e => setNewTask({...newTask, assigned_to:e.target.value})}>
                  <option value="">Assign to user (optional)</option>
                  <option value="__all__">📢 Assign to Everyone</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              {formError && <div style={S.errorMsg}>⚠️ {formError}</div>}
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={{ ...S.addBtn, opacity: submitting ? 0.6 : 1 }} onClick={handleAddTask} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
                <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => { setShowAddForm(false); setFormError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT CARDS */}
          <div style={S.statGrid}>
            {[
              { label:'Total',       num:allTasks.length,              bg:'#EFF6FF', color:'#1A3A6B', icon:'📋' },
              { label:'Pending',     num:kanban.Pending.length,        bg:'#FFFBEB', color:'#92400E', icon:'⏳' },
              { label:'In Progress', num:kanban['In Progress'].length, bg:'#EFF6FF', color:'#1E40AF', icon:'🔄' },
              { label:'Completed',   num:kanban.Completed.length,      bg:'#F0FDF4', color:'#166534', icon:'✅' },
            ].map((s, i) => (
              <div key={i} style={{ ...S.statCard, background:s.bg }}>
                <div style={{ ...S.statIcon, background:s.bg }}>{s.icon}</div>
                <div>
                  <div style={{ ...S.statNum, color:s.color }}>{s.num}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* KANBAN BOARD */}
          {loading ? <div style={S.empty}>Loading tasks...</div> : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div style={S.kanbanGrid}>
                {['Pending', 'In Progress', 'Completed'].map(col => {
                  const cfg = colConfig[col];
                  return (
                    <div key={col} style={{ ...S.kanbanCol, background:cfg.bg, border:`1px solid ${cfg.border}` }}>
                      {/* COLUMN HEADER */}
                      <div style={{ ...S.colHeader, background:cfg.header }}>
                        <span style={{ fontSize:'13px', fontWeight:'700', color:cfg.color }}>
                          {cfg.icon} {col}
                        </span>
                        <span style={{ background:cfg.color, color:'#fff', borderRadius:'50%', width:'20px', height:'20px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700' }}>
                          {kanban[col].length}
                        </span>
                      </div>

                      {/* DROPPABLE */}
                      <Droppable droppableId={col}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ ...S.droppable, background: snapshot.isDraggingOver ? `${cfg.border}50` : 'transparent', minHeight:'200px' }}
                          >
                            {kanban[col].length === 0 ? (
                              <div style={S.dropHint}>Drop tasks here</div>
                            ) : kanban[col].map((task, idx) => (
                              <Draggable key={task.id} draggableId={task.id} index={idx} isDragDisabled={!canManage}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...S.taskCard,
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.85 : 1,
                                      boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                                      cursor: canManage ? 'grab' : 'default',
                                    }}
                                  >
                                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'6px' }}>
                                      <div style={{ fontSize:'12px', fontWeight:'700', color:'#1E293B', flex:1, marginRight:'8px' }}>{task.title}</div>
                                      <span style={{ ...S.badge, background:priBg[task.priority], color:priColor[task.priority] }}>{task.priority}</span>
                                    </div>
                                    {task.description && (
                                      <div style={{ fontSize:'10px', color:'#64748B', marginBottom:'6px', lineHeight:1.4 }}>{task.description}</div>
                                    )}
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'6px' }}>
                                      <div style={{ fontSize:'9px', color: isOverdue(task.deadline) && task.status !== 'Completed' ? '#DC2626' : '#94A3B8' }}>
                                        {task.deadline && `📅 ${new Date(new Date(task.deadline).getTime() + new Date(task.deadline).getTimezoneOffset()*60000).toLocaleDateString('en-IN')}`}
                                        {isOverdue(task.deadline) && task.status !== 'Completed' && ' ⚠️ Overdue'}
                                      </div>
                                      {canManage && (
                                        <button style={S.deleteBtn} onClick={() => handleDelete(task.id)}>🗑</button>
                                      )}
                                    </div>
                                    {task.assigned_to && (
                                      <div style={{ fontSize:'9px', color:'#64748B', marginTop:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
                                        <span>👤</span>
                                        <span>{users.find(u => u.id === task.assigned_to)?.name || 'Assigned'}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>
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
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:         { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'4px', padding:'8px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  addForm:        { background:'#fff', borderRadius:'10px', padding:'14px', border:'1px solid #E2E8F0', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  input:          { padding:'8px 12px', borderRadius:'4px', border:'1px solid #E2E8F0', fontSize:'12px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:"'DM Sans',sans-serif" },
  errorMsg:       { color:'#DC2626', fontSize:'11px', background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:'4px', padding:'6px 10px' },
  statGrid:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:       { borderRadius:'10px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'10px', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  statIcon:       { width:'36px', height:'36px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 },
  statNum:        { fontSize:'20px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'600', marginTop:'2px' },
  kanbanGrid:     { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' },
  kanbanCol:      { borderRadius:'10px', overflow:'hidden' },
  colHeader:      { padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  droppable:      { padding:'8px', transition:'background 0.2s ease', minHeight:'200px', borderRadius:'8px' },
  dropHint:       { textAlign:'center', padding:'30px 10px', fontSize:'11px', color:'#94A3B8', border:'2px dashed #E2E8F0', borderRadius:'8px', margin:'4px' },
  taskCard:       { background:'#fff', borderRadius:'8px', padding:'12px', marginBottom:'8px', border:'1px solid #E2E8F0', transition:'box-shadow 0.2s ease' },
  badge:          { fontSize:'8px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', flexShrink:0, whiteSpace:'nowrap' },
  deleteBtn:      { background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:'4px', padding:'3px 7px', fontSize:'10px', cursor:'pointer' },
  empty:          { padding:'40px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Tasks;