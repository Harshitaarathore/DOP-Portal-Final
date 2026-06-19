import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Announcements() {
  const navigate = useNavigate();
  const role  = localStorage.getItem('role');
  const name  = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const canManage = role === 'Director' || role === 'Secretary';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [form, setForm] = useState({ title:'', content:'', priority:'Medium', category:'General', pinned:false });
  const [formError, setFormError] = useState('');


  const { count: notifCount } = useNotifCount();
  const showToast = (message, type = 'success') => setToast({ message, type });

  const navItems = [
    { label:'Dashboard', path: role === 'Director' ? '/director-dashboard' : '/dashboard', icon:'🏠' },
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

  useEffect(() => { fetchAnnouncements(); }, []);
  
  const fetchAnnouncements = async () => {
  try {
    const res = await API.get('/announcements');
    if (res.data.success) setAnnouncements(res.data.data);
  } catch (err) {
    console.log('Error fetching announcements:', err);
  }
};


const handleSubmit = async () => {
  if (!form.title || !form.content) return alert('Title and content are required');
  setLoading(true);
  try {
    const res = await API.post('/announcements', form);
    if (res.data.success) {
      setForm({ title:'', content:'', priority:'Medium', category:'General', pinned:false });
      setShowForm(false);
      fetchAnnouncements(); // re-fetch from DB
    } else {
      alert('Error: ' + res.data.message);
    }
  } catch (err) {
    alert('Failed to publish announcement');
  } finally {
    setLoading(false);
  }
};

// Replace handleDelete:
const handleDelete = async (id) => {
  if (!window.confirm('Delete this announcement?')) return;
  try {
    const res = await API.delete(`/announcements/${id}`);
    if (res.data.success) fetchAnnouncements();
  } catch (err) { alert('Failed to delete'); }
};

// Replace handlePin:
const handlePin = async (id) => {
  try {
    const res = await API.put(`/announcements/${id}/pin`);
    if (res.data.success) fetchAnnouncements();
  } catch (err) { alert('Failed to pin'); }
};

  const categories = ['all','Academic','Meeting','Placement','Research','Holiday','General'];
  const filtered = activeCategory === 'all' ? announcements : announcements.filter(a => a.category === activeCategory);
  const pinned  = filtered.filter(a => a.pinned);
  const regular = filtered.filter(a => !a.pinned);

  const priBg    = { High:'#FEE2E2', Medium:'#FEF3C7', Low:'#DCFCE7' };
  const priColor = { High:'#991B1B', Medium:'#92400E', Low:'#166534' };
  const catBg    = { Academic:'#DBEAFE', Meeting:'#EDE9FE', Placement:'#DCFCE7', Research:'#FEF3C7', Holiday:'#FEE2E2', General:'#F1F5F9' };
  const catColor = { Academic:'#1E40AF', Meeting:'#5B21B6', Placement:'#166534', Research:'#92400E', Holiday:'#991B1B', General:'#475569' };

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
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>
              🔔 {notifCount > 0 && <span style={S.notifBadge}>{notifCount}</span>}
            </div>
            {/* <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button> */}
            <button style={S.btnLogout} onClick={() => { localStorage.clear(); navigate('/'); }}>⏻ Logout</button>
          </div>
        </div>

        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>📢 Announcements</div>
              <div style={S.pageSub}>Official announcements from Director's Office</div>
            </div>
            {canManage && (
              <button style={S.addBtn} onClick={() => { setShowForm(!showForm); setFormError(''); }}>
                {showForm ? '✕ Cancel' : '+ New Announcement'}
              </button>
            )}
          </div>

          {/* FORM */}
          {showForm && canManage && (
            <div style={S.addForm}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'8px' }}>
                <input style={S.input} placeholder="Announcement title *" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
                <select style={S.input} value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                  {['Academic','Meeting','Placement','Research','Holiday','General'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select style={S.input} value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <textarea style={{ ...S.input, height:'80px', resize:'vertical' }}
                placeholder="Announcement content *"
                value={form.content}
                onChange={e => setForm({...form, content:e.target.value})}
              />
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <input type="checkbox" id="pinned" checked={form.pinned} onChange={e => setForm({...form, pinned:e.target.checked})} />
                <label htmlFor="pinned" style={{ fontSize:'12px', color:'#475569', fontWeight:'600', cursor:'pointer' }}>📌 Pin this announcement</label>
              </div>
              {formError && <div style={S.errorMsg}>⚠️ {formError}</div>}
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={{ ...S.addBtn, opacity: submitting ? 0.6 : 1 }} onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Publishing...' : 'Publish →'}
                </button>
                <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT CARDS */}
          <div style={S.statGrid}>
            {[
              { label:'Total',  num:announcements.length, bg:'#EFF6FF', color:'#1A3A6B' },
              { label:'Pinned', num:announcements.filter(a=>a.pinned).length, bg:'#DBEAFE', color:'#1E40AF' },
              { label:'High Priority', num:announcements.filter(a=>a.priority==='High').length, bg:'#FEE2E2', color:'#991B1B' },
              { label:'Categories', num:categories.length - 1, bg:'#F0FDF4', color:'#166534' },
            ].map((s, i) => (
              <div key={i} style={{ ...S.statCard, background:s.bg }}>
                <div style={{ ...S.statNum, color:s.color }}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* CATEGORY TABS */}
          <div style={S.tabs}>
            {categories.map(cat => (
              <div key={cat}
                style={{ ...S.tab, ...(activeCategory === cat ? S.tabActive : {}) }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </div>
            ))}
          </div>

          {/* LOADING */}
          {loading ? (
            <div style={S.empty}>Loading announcements...</div>
          ) : filtered.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize:'32px', marginBottom:'8px' }}>📢</div>
              <div style={{ fontSize:'13px', fontWeight:'600', color:'#1E293B' }}>No announcements yet</div>
            </div>
          ) : (
            <>
              {/* PINNED */}
              {pinned.length > 0 && (
                <div style={{ marginBottom:'16px' }}>
                  <div style={S.sectionLabel}>📌 Pinned</div>
                  {pinned.map(ann => (
                    <AnnouncementCard key={ann.id} ann={ann} expanded={expandedId === ann.id}
                      onExpand={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                      onDelete={handleDelete} onPin={handlePin}
                      canManage={canManage} priBg={priBg} priColor={priColor} catBg={catBg} catColor={catColor} isPinned={true}
                    />
                  ))}
                </div>
              )}
              {/* REGULAR */}
              {regular.length > 0 && (
                <div>
                  {pinned.length > 0 && <div style={S.sectionLabel}>📋 All Announcements</div>}
                  {regular.map(ann => (
                    <AnnouncementCard key={ann.id} ann={ann} expanded={expandedId === ann.id}
                      onExpand={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                      onDelete={handleDelete} onPin={handlePin}
                      canManage={canManage} priBg={priBg} priColor={priColor} catBg={catBg} catColor={catColor} isPinned={false}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AnnouncementCard({ ann, expanded, onExpand, onDelete, onPin, canManage, priBg, priColor, catBg, catColor, isPinned }) {
  const borderColor = ann.priority === 'High' ? '#EF4444' : ann.priority === 'Medium' ? '#F59E0B' : '#10B981';
  return (
    <div style={{ background:'#fff', borderRadius:'10px', border:`1px solid ${isPinned ? '#BFDBFE' : '#E2E8F0'}`, borderLeft:`4px solid ${borderColor}`, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', marginBottom:'10px', overflow:'hidden' }}>
      <div style={{ padding:'14px 16px', cursor:'pointer' }} onClick={onExpand}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
              {isPinned && <span style={{ fontSize:'12px' }}>📌</span>}
              <span style={{ fontSize:'13px', fontWeight:'700', color:'#1E293B' }}>{ann.title}</span>
            </div>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'6px' }}>
              <span style={{ fontSize:'9px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', background:priBg[ann.priority], color:priColor[ann.priority] }}>{ann.priority}</span>
              <span style={{ fontSize:'9px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', background:catBg[ann.category]||'#F1F5F9', color:catColor[ann.category]||'#475569' }}>{ann.category}</span>
            </div>
            <div style={{ fontSize:'10px', color:'#94A3B8' }}>
              By {ann.author} · {new Date(ann.created_at).toLocaleDateString('en-IN')}
            </div>
          </div>
          <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
            {canManage && (
              <>
                <button style={{ background: isPinned ? '#DBEAFE' : '#F1F5F9', color: isPinned ? '#1E40AF' : '#64748B', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'10px', cursor:'pointer', fontWeight:'600' }}
                  onClick={e => { e.stopPropagation(); onPin(ann.id); }}>
                  {isPinned ? 'Unpin' : '📌 Pin'}
                </button>
                <button style={{ background:'#FEE2E2', color:'#991B1B', border:'none', borderRadius:'6px', padding:'4px 10px', fontSize:'10px', cursor:'pointer', fontWeight:'600' }}
                  onClick={e => { e.stopPropagation(); onDelete(ann.id); }}>
                  🗑
                </button>
              </>
            )}
            <span style={{ fontSize:'14px', color:'#94A3B8' }}>{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
        {!expanded && (
          <div style={{ fontSize:'11px', color:'#64748B', marginTop:'8px', lineHeight:1.5 }}>
            {ann.content?.slice(0, 120)}...
          </div>
        )}
      </div>
      {expanded && (
        <div style={{ padding:'0 16px 16px', borderTop:'1px solid #F1F5F9' }}>
          <div style={{ fontSize:'12px', color:'#475569', lineHeight:1.8, marginTop:'12px' }}>{ann.content}</div>
        </div>
      )}
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
  statCard:       { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  statNum:        { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  tabs:           { display:'flex', gap:'4px', marginBottom:'14px', background:'#F1F5F9', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', flexWrap:'wrap' },
  tab:            { padding:'6px 14px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  sectionLabel:   { fontSize:'11px', fontWeight:'700', color:'#64748B', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' },
  empty:          { textAlign:'center', padding:'40px', color:'#94A3B8' },
};

export default Announcements;