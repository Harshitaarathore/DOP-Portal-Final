import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Tasks() {
  const navigate = useNavigate();
  const [kanban, setKanban] = useState({ Pending: [], 'In Progress': [], Completed: [] });
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '', deadline: '', priority: 'Low' });
  const role = localStorage.getItem('role');
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks');
      if (res.data.success) setKanban(res.data.data);
    } catch (err) {
      console.log('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // optimistic UI update
    const newKanban = { ...kanban };
    const sourceList = [...newKanban[source.droppableId]];
    const destList = [...newKanban[destination.droppableId]];
    const [moved] = sourceList.splice(source.index, 1);
    moved.status = newStatus;

    if (source.droppableId === destination.droppableId) {
      sourceList.splice(destination.index, 0, moved);
      newKanban[source.droppableId] = sourceList;
    } else {
      destList.splice(destination.index, 0, moved);
      newKanban[source.droppableId] = sourceList;
      newKanban[destination.droppableId] = destList;
    }
    setKanban(newKanban);

    // update backend
    try {
      await API.put(`/tasks/${draggableId}/status`, { status: newStatus });
    } catch (err) {
      alert('Failed to update task status');
      fetchTasks();
    }
  };

  const handleAddTask = async () => {
    try {
      const res = await API.post('/tasks', newTask);
      if (res.data.success) {
        alert('Task created!');
        setShowAddForm(false);
        setNewTask({ title: '', description: '', assigned_to: '', deadline: '', priority: 'Low' });
        fetchTasks();
      }
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await API.delete(`/tasks/${id}`);
      if (res.data.success) fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const priBg = { High: '#FEE2E2', Medium: '#DBEAFE', Low: '#DCFCE7' };
  const priColor = { High: '#991B1B', Medium: '#1E40AF', Low: '#166534' };
  const colBg = { Pending: '#FEF3C7', 'In Progress': '#DBEAFE', Completed: '#DCFCE7' };
  const colColor = { Pending: '#92400E', 'In Progress': '#1E40AF', Completed: '#166534' };
  const colIcon = { Pending: '⏳', 'In Progress': '🔄', Completed: '✅' };

  const allTasks = [...kanban.Pending, ...kanban['In Progress'], ...kanban.Completed];

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.lnmiitLogo} />
          <div style={styles.logoTitle}>Director's Office Portal</div>
          <div style={styles.logoSub}>Director's Office</div>
        </div>
        {[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Calendar', path: '/calendar' },
          { label: 'Requests', path: '/requests' },
          { label: 'Documents', path: '/documents' },
          { label: 'Visitors', path: '/visitors' },
          { label: 'Communication', path: '/communications' },
          { label: 'Tasks', path: '/tasks' },
          { label: 'Reports', path: '/reports' },
          { label: 'Settings', path: '/settings' },
        ].map((item, i) => (
          <div key={i}
            style={{ ...styles.navItem, ...(i === 5 ? styles.navActive : {}) }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={lnmiitLogo} alt="LNMIIT" style={styles.topbarLogo} />
            <div>
              <div style={styles.topbarTitle}>Director's Office Portal — LNMIIT</div>
              <div style={styles.topbarSub}>{today}</div>
            </div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <button style={styles.logoutTopBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>✅ Tasks — Kanban Board</div>
              <div style={styles.pageSub}>Drag and drop tasks to update status</div>
            </div>
            {(role === 'Secretary' || role === 'Director') && (
              <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>+ Add Task</button>
            )}
          </div>

          {/* ADD TASK FORM */}
          {showAddForm && (
            <div style={styles.addForm}>
              <input style={styles.input} placeholder="Task title *" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              <input style={styles.input} placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              <input style={styles.input} placeholder="Assign to (user ID)" value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })} />
              <input style={styles.input} type="date" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
              <select style={styles.input} value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={styles.addBtn} onClick={handleAddTask}>Save Task</button>
                <button style={{ ...styles.addBtn, background: '#64748B' }} onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              { label: 'Total', num: allTasks.length, bg: '#EFF6FF', color: '#1A3A6B' },
              { label: 'Pending', num: kanban.Pending.length, bg: '#FEF3C7', color: '#92400E' },
              { label: 'In Progress', num: kanban['In Progress'].length, bg: '#DBEAFE', color: '#1E40AF' },
              { label: 'Completed', num: kanban.Completed.length, bg: '#DCFCE7', color: '#166534' },
            ].map((s, i) => (
              <div key={i} style={{ ...styles.statCard, background: s.bg }}>
                <div style={{ ...styles.statNum, color: s.color }}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* KANBAN BOARD */}
          {loading ? (
            <div style={styles.emptyMsg}>Loading tasks...</div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div style={styles.kanbanBoard}>
                {['Pending', 'In Progress', 'Completed'].map(col => (
                  <div key={col} style={styles.kanbanCol}>
                    {/* COLUMN HEADER */}
                    <div style={{ ...styles.colHeader, background: colBg[col] }}>
                      <span style={{ ...styles.colTitle, color: colColor[col] }}>
                        {colIcon[col]} {col}
                      </span>
                      <span style={{ ...styles.colCount, background: colColor[col] }}>
                        {kanban[col].length}
                      </span>
                    </div>

                    {/* DROPPABLE AREA */}
                    <Droppable droppableId={col}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            ...styles.colBody,
                            background: snapshot.isDraggingOver ? '#F0F4FA' : '#F8FAFC',
                            minHeight: '200px'
                          }}
                        >
                          {kanban[col].length === 0 ? (
                            <div style={styles.emptyCol}>Drop tasks here</div>
                          ) : kanban[col].map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{
                                    ...styles.taskCard,
                                    boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.05)',
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <div style={styles.taskTop}>
                                    <div style={styles.taskTitle}>{task.title}</div>
                                    <span style={{ ...styles.badge2, background: priBg[task.priority], color: priColor[task.priority] }}>{task.priority}</span>
                                  </div>
                                  {task.description && (
                                    <div style={styles.taskDesc}>{task.description.slice(0, 50)}{task.description.length > 50 ? '...' : ''}</div>
                                  )}
                                  <div style={styles.taskMeta}>
                                    📅 {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                  </div>
                                  {(role === 'Secretary' || role === 'Director') && (
                                    <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>🗑</button>
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
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', height: '100vh', fontFamily: "'DM Sans',sans-serif", background: '#F0F4FA', overflow: 'hidden' },
  sidebar: { width: '168px', background: '#122951', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarLogo: { padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' },
  logoRow: { display: 'flex', gap: '6px', marginBottom: '8px' },
  badge: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px' },
  logoTitle: { color: '#fff', fontSize: '13px', fontWeight: '700' },
  logoSub: { color: 'rgba(255,255,255,0.4)', fontSize: '9px' },
  navItem: { display: 'flex', alignItems: 'center', padding: '9px 16px', margin: '1px 8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  navActive: { background: 'rgba(37,99,235,0.35)', color: '#fff' },
  sidebarFooter: { marginTop: 'auto', padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 },
  userName: { color: '#fff', fontSize: '11px', fontWeight: '600' },
  userRole: { color: 'rgba(255,255,255,0.45)', fontSize: '9px' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar: { background: '#1A3A6B', padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarTitle: { color: '#fff', fontSize: '14px', fontWeight: '700' },
  topbarSub: { color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '1px' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  notifBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '14px', cursor: 'pointer' },
  rolePill: { background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.5)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#fff', fontWeight: '600', cursor: 'pointer' },
  content: { flex: 1, overflowY: 'auto', padding: '18px 22px' },
  pageHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  pageTitle: { fontSize: '16px', fontWeight: '700', color: '#1E293B' },
  pageSub: { fontSize: '11px', color: '#64748B', marginTop: '2px' },
  addBtn: { background: '#1A3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  addForm: { background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', outline: 'none' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' },
  statCard: { borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' },
  statNum: { fontSize: '20px', fontWeight: '700', lineHeight: 1 },
  statLabel: { fontSize: '10px', color: '#64748B', fontWeight: '500' },
  kanbanBoard: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' },
  kanbanCol: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' },
  colHeader: { padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  colTitle: { fontSize: '12px', fontWeight: '700' },
  colCount: { color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
  colBody: { padding: '10px', transition: 'background 0.2s', borderRadius: '0 0 12px 12px' },
  emptyCol: { textAlign: 'center', fontSize: '11px', color: '#94A3B8', padding: '20px 0', borderRadius: '8px', border: '2px dashed #E2E8F0' },
  taskCard: { background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0', marginBottom: '8px', cursor: 'grab' },
  taskTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' },
  taskTitle: { fontSize: '12px', fontWeight: '700', color: '#1E293B', flex: 1, marginRight: '8px' },
  taskDesc: { fontSize: '10px', color: '#64748B', marginBottom: '6px', lineHeight: 1.4 },
  taskMeta: { fontSize: '10px', color: '#94A3B8', marginBottom: '6px' },
  badge2: { fontSize: '9px', fontWeight: '700', padding: '3px 9px', borderRadius: '10px', flexShrink: 0 },
  deleteBtn: { background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' },
  emptyMsg: { padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' },
  logoutTopBtn: { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#FCA5A5', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  lnmiitLogo: { width: '90px', objectFit: 'contain', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '4px' },
  topbarLogo: { height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '3px' },
  topbarSub: { color: 'rgba(255,255,255,0.7)', fontSize: '10px', marginTop: '1px' },
};

export default Tasks;