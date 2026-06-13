import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Announcements() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';

  const [announcements, setAnnouncements] = useState([
    { id:1, title:'NAAC Inspection Schedule', content:'NAAC peer team will visit LNMIIT from June 10-12, 2026. All departments must ensure their documentation is complete and ready for review. Please coordinate with your respective HODs.', priority:'High', category:'Academic', author:'Director', date:'2026-05-24', pinned:true },
    { id:2, title:'Faculty Senate Meeting — May 2026', content:'The monthly Faculty Senate meeting is scheduled for May 30, 2026 at 2:00 PM in the Conference Hall. Agenda includes curriculum updates, research fund allocations, and upcoming accreditation preparations.', priority:'Medium', category:'Meeting', author:'Secretary', date:'2026-05-23', pinned:false },
    { id:3, title:'Campus Recruitment Drive — TCS & Infosys', content:'TCS and Infosys will be conducting campus recruitment on June 5, 2026. Final year BTech and MTech students are requested to register through the placement portal by May 28.', priority:'Medium', category:'Placement', author:'Director', date:'2026-05-22', pinned:false },
    { id:4, title:'Research Fund Applications Open', content:'Applications for the Director Research Fund 2026-27 are now open. Faculty members can submit their proposals through the DOP Portal. Last date for submission is June 15, 2026.', priority:'Low', category:'Research', author:'Director', date:'2026-05-20', pinned:false },
    { id:5, title:'Holiday Notice — Eid al-Adha', content:'The institute will remain closed on June 17, 2026 on account of Eid al-Adha. All pending work should be completed before the holiday.', priority:'Low', category:'Holiday', author:'Secretary', date:'2026-05-18', pinned:false },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'Medium',
    category: 'General',
    pinned: false,
  });

  const categories = ['all', 'Academic', 'Meeting', 'Placement', 'Research', 'Holiday', 'General'];

  const filtered = activeCategory === 'all'
    ? announcements
    : announcements.filter(a => a.category === activeCategory);

  const pinned = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    try {
      await API.post('/announcements', form);
    } catch (err) {}
    const newAnn = {
      id: Date.now(),
      ...form,
      author: name,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    setForm({ title:'', content:'', priority:'Medium', category:'General', pinned:false });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handlePin = (id) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? {...a, pinned: !a.pinned} : a));
  };

  const priBg    = { High:'#FEE2E2', Medium:'#FEF3C7', Low:'#DCFCE7' };
  const priColor = { High:'#991B1B', Medium:'#92400E', Low:'#166534' };
  const catBg    = { Academic:'#DBEAFE', Meeting:'#EDE9FE', Placement:'#DCFCE7', Research:'#FEF3C7', Holiday:'#FEE2E2', General:'#F1F5F9' };
  const catColor = { Academic:'#1E40AF', Meeting:'#5B21B6', Placement:'#166534', Research:'#92400E', Holiday:'#991B1B', General:'#475569' };

  const getSidebarPath = () => {
    if (role === 'Director') return '/director-dashboard';
    if (role === 'Faculty' || role === 'Staff') return '/faculty-dashboard';
    return '/dashboard';
  };

  const navItems = role === 'Director' ? [
    {label:'Dashboard',     path:'/director-dashboard'},
    {label:'Requests',      path:'/director-requests'},
    {label:'Calendar',      path:'/calendar'},
    {label:'Announcements', path:'/announcements'},
    {label:'Documents',     path:'/documents'},
    {label:'Visitors',      path:'/visitors'},
    {label:'Tasks',         path:'/tasks'},
    {label:'Reports',       path:'/reports'},
    {label:'Settings',      path:'/settings'},
  ] : role === 'Faculty' || role === 'Staff' ? [
    {label:'Dashboard',     path:'/faculty-dashboard'},
    {label:'My Requests',   path:'/faculty-requests'},
    {label:'Calendar',      path:'/faculty-calendar'},
    {label:'Announcements', path:'/announcements'},
    {label:'My Tasks',      path:'/tasks'},
    {label:'Settings',      path:'/settings'},
  ] : [
    {label:'Dashboard',     path:'/dashboard'},
    {label:'Calendar',      path:'/calendar'},
    {label:'Requests',      path:'/requests'},
    {label:'Announcements', path:'/announcements'},
    {label:'Documents',     path:'/documents'},
    {label:'Visitors',      path:'/visitors'},
    {label:'Tasks',         path:'/tasks'},
    {label:'Reports',       path:'/reports'},
    {label:'Settings',      path:'/settings'},
  ];

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
        {navItems.map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(item.path === window.location.pathname ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>{name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}</div>
          <div style={{flex:1}}>
            <div style={styles.userName}>{name}</div>
            <div style={styles.userRole}>{role}</div>
          </div>
          <div style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.topbarSub}>Director's Office Portal</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 {role} ▾</div>
          </div>
        </div>

        <div style={styles.content}>

          {/* HEADER */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📢 Announcements</div>
              <div style={styles.pageSub}>Official announcements from Director's Office</div>
            </div>
            {(role === 'Director' || role === 'Secretary') && (
              <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                {showForm ? '✕ Cancel' : '+ New Announcement'}
              </button>
            )}
          </div>

          {/* NEW ANNOUNCEMENT FORM */}
          {showForm && (role === 'Director' || role === 'Secretary') && (
            <div style={styles.formCard}>
              <div style={styles.formTitle}>📢 Create New Announcement</div>
              <div style={{marginBottom:'14px'}}>
                <label style={styles.label}>Title *</label>
                <input style={styles.input} placeholder="Announcement title"
                  value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
              </div>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Category *</label>
                  <select style={styles.select}
                    value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    {['Academic','Meeting','Placement','Research','Holiday','General'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Priority *</label>
                  <select style={styles.select}
                    value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:'14px'}}>
                <label style={styles.label}>Content *</label>
                <textarea style={styles.textarea}
                  placeholder="Write announcement content here..."
                  value={form.content}
                  onChange={e => setForm({...form, content:e.target.value})}
                  rows={4}
                />
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                <input type="checkbox" id="pinned"
                  checked={form.pinned}
                  onChange={e => setForm({...form, pinned:e.target.checked})}
                />
                <label htmlFor="pinned" style={{fontSize:'12px', color:'#475569', fontWeight:'600', cursor:'pointer'}}>
                  📌 Pin this announcement (shows at top)
                </label>
              </div>
              <button style={styles.submitBtn} onClick={handleSubmit}>
                Publish Announcement →
              </button>
            </div>
          )}

          {/* CATEGORY TABS */}
          <div style={styles.tabs}>
            {categories.map(cat => (
              <div key={cat}
                style={{...styles.tab, ...(activeCategory===cat ? styles.tabActive : {})}}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </div>
            ))}
          </div>

          {/* PINNED ANNOUNCEMENTS */}
          {pinned.length > 0 && (
            <div style={{marginBottom:'16px'}}>
              <div style={styles.sectionLabel}>📌 Pinned</div>
              {pinned.map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  ann={ann}
                  expanded={expandedId === ann.id}
                  onExpand={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  role={role}
                  priBg={priBg} priColor={priColor}
                  catBg={catBg} catColor={catColor}
                  pinned={true}
                />
              ))}
            </div>
          )}

          {/* REGULAR ANNOUNCEMENTS */}
          <div>
            {pinned.length > 0 && <div style={styles.sectionLabel}>📋 All Announcements</div>}
            {regular.length === 0 && pinned.length === 0 ? (
              <div style={styles.noData}>
                <div style={{fontSize:'32px', marginBottom:'10px'}}>📢</div>
                <div style={{fontSize:'13px', fontWeight:'600', color:'#1E293B'}}>No announcements yet</div>
              </div>
            ) : (
              regular.map(ann => (
                <AnnouncementCard
                  key={ann.id}
                  ann={ann}
                  expanded={expandedId === ann.id}
                  onExpand={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                  onDelete={handleDelete}
                  onPin={handlePin}
                  role={role}
                  priBg={priBg} priColor={priColor}
                  catBg={catBg} catColor={catColor}
                  pinned={false}
                />
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ ann, expanded, onExpand, onDelete, onPin, role, priBg, priColor, catBg, catColor, pinned }) {
  return (
    <div style={{
      background:'#fff',
      borderRadius:'12px',
      border:`1px solid ${pinned ? '#BFDBFE' : '#E2E8F0'}`,
      borderLeft: `4px solid ${ann.priority === 'High' ? '#EF4444' : ann.priority === 'Medium' ? '#F59E0B' : '#10B981'}`,
      boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
      marginBottom:'10px',
      overflow:'hidden',
    }}>
      {/* CARD TOP */}
      <div style={{padding:'14px 16px', cursor:'pointer'}} onClick={onExpand}>
        <div style={{display:'flex', alignItems:'flex-start', gap:'10px'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap'}}>
              {pinned && <span style={{fontSize:'12px'}}>📌</span>}
              <span style={{fontSize:'13px', fontWeight:'700', color:'#1E293B'}}>{ann.title}</span>
            </div>
            <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'6px'}}>
              <span style={{fontSize:'9px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', background:priBg[ann.priority], color:priColor[ann.priority]}}>{ann.priority}</span>
              <span style={{fontSize:'9px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', background:catBg[ann.category], color:catColor[ann.category]}}>{ann.category}</span>
            </div>
            <div style={{fontSize:'10px', color:'#94A3B8'}}>
              By {ann.author} · {ann.date}
            </div>
          </div>
          <div style={{display:'flex', gap:'6px', flexShrink:0}}>
            {(role === 'Director' || role === 'Secretary') && (
              <>
                <button
                  style={{background: pinned ? '#DBEAFE' : '#F1F5F9', color: pinned ? '#1E40AF' : '#64748B', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'10px', cursor:'pointer', fontWeight:'600'}}
                  onClick={e => { e.stopPropagation(); onPin(ann.id); }}
                >
                  {pinned ? 'Unpin' : '📌 Pin'}
                </button>
                <button
                  style={{background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'10px', cursor:'pointer', fontWeight:'600'}}
                  onClick={e => { e.stopPropagation(); onDelete(ann.id); }}
                >
                  Delete
                </button>
              </>
            )}
            <span style={{fontSize:'16px', color:'#94A3B8'}}>{expanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* PREVIEW */}
        {!expanded && (
          <div style={{fontSize:'11px', color:'#64748B', marginTop:'8px', lineHeight:1.5}}>
            {ann.content.slice(0, 120)}...
          </div>
        )}
      </div>

      {/* EXPANDED CONTENT */}
      {expanded && (
        <div style={{padding:'0 16px 16px', borderTop:'1px solid #F1F5F9'}}>
          <div style={{fontSize:'12px', color:'#475569', lineHeight:1.8, marginTop:'12px'}}>
            {ann.content}
          </div>
        </div>
      )}
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
  pageHeader:    { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:     { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:       { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:        { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  formCard:      { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  formTitle:     { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #F1F5F9' },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' },
  label:         { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:         { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  select:        { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  textarea:      { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:"'DM Sans',sans-serif" },
  submitBtn:     { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px 24px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  tabs:          { display:'flex', gap:'4px', marginBottom:'14px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', width:'fit-content', flexWrap:'wrap' },
  tab:           { padding:'6px 14px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:     { background:'#1A3A6B', color:'#fff' },
  sectionLabel:  { fontSize:'11px', fontWeight:'700', color:'#64748B', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' },
  noData:        { textAlign:'center', padding:'40px', color:'#94A3B8' },
};

export default Announcements;