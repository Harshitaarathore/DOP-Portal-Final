import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1A3A6B';
  return (
    <div style={{ position:'fixed', top:'20px', right:'20px', background:bg, color:'#fff', padding:'12px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:'600', zIndex:9999, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:'8px' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {message}
    </div>
  );
}

function Communications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [communications, setCommunications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [newComm, setNewComm] = useState({ type:'email', sender:'', subject:'', content:'', tagged_as:'', direction:'inward' });
  const [formError, setFormError] = useState('');

  const role  = localStorage.getItem('role');
  const name  = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const navItems = [
    { label:'Dashboard',     icon:'🏠', path:'/dashboard' },
    { label:'Calendar',      icon:'📅', path:'/calendar' },
    { label:'Requests',      icon:'📋', path:'/requests' },
    { label:'Documents',     icon:'📁', path:'/documents' },
    { label:'Visitors',      icon:'👥', path:'/visitors' },
    { label:'Communication', icon:'📬', path:'/communications' },
    { label:'Tasks',         icon:'✅', path:'/tasks' },
    { label:'Announcements', icon:'📢', path:'/announcements' },
    { label:'Reports',       icon:'📊', path:'/reports' },
    { label:'Settings',      icon:'⚙️', path:'/settings' },
  ];

  useEffect(() => { fetchCommunications(); }, [activeFilter]);

  const fetchCommunications = async () => {
    try {
      let url = '/communications';
      if (activeFilter !== 'all') url += `?status=${activeFilter}`;
      const res = await API.get(url);
      if (res.data.success) setCommunications(res.data.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await API.put(`/communications/${id}/status`, { status });
      if (res.data.success) {
        fetchCommunications();
        setSelected(prev => prev ? { ...prev, status } : null);
        showToast(`Marked as ${status}`, 'success');
      } else { showToast(res.data.message, 'error'); }
    } catch { showToast('Failed to update status', 'error'); }
  };

  const handleAdd = async () => {
    setFormError('');
    if (!newComm.sender.trim()) { setFormError('Sender is required'); return; }
    if (!newComm.subject.trim()) { setFormError('Subject is required'); return; }

    setSubmitting(true);
    try {
      const res = await API.post('/communications', newComm);
      if (res.data.success) {
        showToast('Communication logged successfully', 'success');
        setShowAddForm(false);
        setNewComm({ type:'email', sender:'', subject:'', content:'', tagged_as:'', direction:'inward' });
        fetchCommunications();
      } else { setFormError(res.data.message || 'Failed to log'); }
    } catch { setFormError('Failed to log communication'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this communication?')) return;
    try {
      const res = await API.delete(`/communications/${id}`);
      if (res.data.success) {
        fetchCommunications();
        setSelected(null);
        showToast('Communication deleted', 'success');
      } else { showToast(res.data.message, 'error'); }
    } catch { showToast('Failed to delete', 'error'); }
  };

  const filtered = communications.filter(c =>
    searchTerm === '' ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stBg    = { open:'#DBEAFE', pending:'#FEF3C7', closed:'#DCFCE7' };
  const stColor = { open:'#1E40AF', pending:'#92400E', closed:'#166534' };
  const typeBg  = { email:'#EDE9FE', letter:'#FEF3C7' };
  const typeColor = { email:'#5B21B6', letter:'#92400E' };
  const tagBg   = { urgent:'#FEE2E2', academic:'#DBEAFE', admin:'#DCFCE7', external:'#EDE9FE' };
  const tagColor = { urgent:'#991B1B', academic:'#1E40AF', admin:'#166534', external:'#5B21B6' };

  return (
    <div style={S.page} className="page-transition">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>🔔</div>
            <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button>
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>📬 Communication Hub</div>
              <div style={S.pageSub}>Incoming → Logged → Tagged → Assigned → Closed</div>
            </div>
            <button style={S.addBtn} onClick={() => { setShowAddForm(!showAddForm); setFormError(''); }}>
              + Log Communication
            </button>
          </div>

          {/* ADD FORM */}
          {showAddForm && (
            <div style={S.addForm}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'4px' }}>
                <select style={S.input} value={newComm.type} onChange={e => setNewComm({...newComm, type:e.target.value})}>
                  <option value="email">📧 Email</option>
                  <option value="letter">📄 Letter</option>
                </select>
                <select style={S.input} value={newComm.direction} onChange={e => setNewComm({...newComm, direction:e.target.value})}>
                  <option value="inward">📥 Inward</option>
                  <option value="outward">📤 Outward</option>
                </select>
                <select style={S.input} value={newComm.tagged_as} onChange={e => setNewComm({...newComm, tagged_as:e.target.value})}>
                  <option value="">Tag as...</option>
                  <option value="urgent">🔴 Urgent</option>
                  <option value="academic">📚 Academic</option>
                  <option value="admin">⚙️ Admin</option>
                  <option value="external">🌐 External</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <input style={S.input} placeholder="Sender / From *" value={newComm.sender} onChange={e => setNewComm({...newComm, sender:e.target.value})} />
                <input style={S.input} placeholder="Subject *" value={newComm.subject} onChange={e => setNewComm({...newComm, subject:e.target.value})} />
              </div>
              <textarea style={{ ...S.input, height:'70px', resize:'vertical' }} placeholder="Content / Notes" value={newComm.content} onChange={e => setNewComm({...newComm, content:e.target.value})} />
              {formError && <div style={S.errorMsg}>⚠️ {formError}</div>}
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={{ ...S.addBtn, opacity: submitting ? 0.6 : 1 }} onClick={handleAdd} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Communication'}
                </button>
                <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => { setShowAddForm(false); setFormError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT CARDS */}
          <div style={S.statGrid}>
            {[
              { icon:'📊', num:communications.length, label:'Total', bg:'#EFF6FF', color:'#1A3A6B', filter:'all' },
              { icon:'🔵', num:communications.filter(c=>c.status==='open').length, label:'Open', bg:'#DBEAFE', color:'#1E40AF', filter:'open' },
              { icon:'🟡', num:communications.filter(c=>c.status==='pending').length, label:'Pending', bg:'#FEF3C7', color:'#92400E', filter:'pending' },
              { icon:'✅', num:communications.filter(c=>c.status==='closed').length, label:'Closed', bg:'#DCFCE7', color:'#166534', filter:'closed' },
            ].map((s, i) => (
              <div key={i}
                style={{
                  ...S.statCard, background:s.bg,
                  ...(hoveredStat === i ? { boxShadow:'0 4px 12px rgba(0,0,0,0.1)', transform:'translateY(-2px)' } : {}),
                  ...(activeFilter === s.filter ? { border:`2px solid ${s.color}` } : {})
                }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => setActiveFilter(s.filter)}
              >
                <div style={{ ...S.statIcon, background:s.bg }}>{s.icon}</div>
                <div>
                  <div style={{ ...S.statNum, color:s.color }}>{s.num}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FILTERS + SEARCH */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <div style={{ display:'flex', gap:'4px', background:'#fff', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0' }}>
              {['all','open','pending','closed'].map(f => (
                <div key={f}
                  style={{ ...S.tab, ...(activeFilter === f ? S.tabActive : {}) }}
                  onClick={() => setActiveFilter(f)}
                >
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="🔍 Search by subject, sender..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...S.input, width:'260px', marginBottom:0 }}
            />
          </div>

          {/* LAYOUT */}
          <div style={S.layout}>

            {/* LEFT — LIST */}
            <div style={S.listPanel}>
              {loading ? <div style={S.empty}>Loading...</div>
              : filtered.length === 0 ? <div style={S.empty}>No communications found</div>
              : filtered.map((c, idx) => (
                <div key={c.id}
                  style={{
                    ...S.commCard,
                    ...(selected?.id === c.id ? S.commCardActive : {}),
                    ...(hoveredCard === idx && selected?.id !== c.id ? { boxShadow:'0 4px 12px rgba(0,0,0,0.08)', transform:'translateY(-1px)' } : {})
                  }}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setSelected(c)}
                >
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ ...S.badge, background:typeBg[c.type]||'#EDE9FE', color:typeColor[c.type]||'#5B21B6' }}>
                        {c.type === 'email' ? '📧' : '📄'} {c.type}
                      </span>
                      <span style={{ ...S.badge, background:c.direction==='inward'?'#DBEAFE':'#DCFCE7', color:c.direction==='inward'?'#1E40AF':'#166534' }}>
                        {c.direction==='inward'?'📥':'📤'} {c.direction}
                      </span>
                    </div>
                    <span style={{ ...S.badge, background:stBg[c.status]||'#E2E8F0', color:stColor[c.status]||'#64748B' }}>{c.status}</span>
                  </div>
                  <div style={{ fontSize:'12px', fontWeight:'700', color:'#1E293B', marginBottom:'3px' }}>{c.subject}</div>
                  <div style={{ fontSize:'10px', color:'#64748B', marginBottom:'5px' }}>From: {c.sender}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    {c.tagged_as && <span style={{ ...S.badge, background:tagBg[c.tagged_as]||'#EFF6FF', color:tagColor[c.tagged_as]||'#1A3A6B' }}>{c.tagged_as}</span>}
                    <span style={{ fontSize:'9px', color:'#94A3B8', marginLeft:'auto' }}>{new Date(c.date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — DETAIL */}
            <div style={S.detailPanel}>
              {selected ? (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', paddingBottom:'12px', borderBottom:'1px solid #F1F5F9' }}>
                    <span style={{ ...S.badge, background:typeBg[selected.type], color:typeColor[selected.type], fontSize:'11px', padding:'4px 10px' }}>
                      {selected.type === 'email' ? '📧 Email' : '📄 Letter'}
                    </span>
                    <span style={{ ...S.badge, background:stBg[selected.status], color:stColor[selected.status] }}>{selected.status}</span>
                    {selected.tagged_as && <span style={{ ...S.badge, background:tagBg[selected.tagged_as], color:tagColor[selected.tagged_as] }}>{selected.tagged_as}</span>}
                  </div>

                  <div style={{ fontSize:'14px', fontWeight:'700', color:'#1E293B', marginBottom:'14px' }}>{selected.subject}</div>

                  {[
                    { label:'From',      value: selected.sender },
                    { label:'Direction', value: selected.direction?.charAt(0).toUpperCase()+selected.direction?.slice(1) },
                    { label:'Date',      value: new Date(selected.date).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) },
                    { label:'Assigned',  value: selected.assigned_to || 'Unassigned' },
                  ].map((row, i) => (
                    <div key={i} style={S.detailRow}>
                      <span style={S.detailLabel}>{row.label}</span>
                      <span style={S.detailValue}>{row.value}</span>
                    </div>
                  ))}

                  {selected.content && (
                    <div style={{ marginTop:'12px', background:'#F8FAFC', borderRadius:'8px', padding:'12px', border:'1px solid #E2E8F0' }}>
                      <div style={{ fontSize:'10px', fontWeight:'700', color:'#64748B', marginBottom:'6px' }}>CONTENT</div>
                      <div style={{ fontSize:'11px', color:'#475569', lineHeight:1.7 }}>{selected.content}</div>
                    </div>
                  )}

                  {/* STATUS WORKFLOW */}
                  <div style={{ marginTop:'16px' }}>
                    <div style={{ fontSize:'10px', fontWeight:'700', color:'#64748B', marginBottom:'8px' }}>UPDATE STATUS</div>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      {selected.status !== 'open' && (
                        <button style={{ ...S.actionBtn, background:'#DBEAFE', color:'#1E40AF' }} onClick={() => handleStatusUpdate(selected.id, 'open')}>Mark Open</button>
                      )}
                      {selected.status !== 'pending' && (
                        <button style={{ ...S.actionBtn, background:'#FEF3C7', color:'#92400E' }} onClick={() => handleStatusUpdate(selected.id, 'pending')}>Mark Pending</button>
                      )}
                      {selected.status !== 'closed' && (
                        <button style={{ ...S.actionBtn, background:'#DCFCE7', color:'#166534' }} onClick={() => handleStatusUpdate(selected.id, 'closed')}>Mark Closed</button>
                      )}
                      {role === 'Director' && (
                        <button style={{ ...S.actionBtn, background:'#FEE2E2', color:'#991B1B' }} onClick={() => handleDelete(selected.id)}>🗑 Delete</button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div style={S.noSelection}>
                  <div style={{ fontSize:'36px', marginBottom:'10px' }}>📬</div>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'#1E293B' }}>Select a communication</div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'4px' }}>Click any item to view details</div>
                </div>
              )}
            </div>
          </div>
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
  btnOutline:     { background:'transparent', color:'#1A3A6B', border:'1px solid #1A3A6B', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer', whiteSpace:'nowrap' },
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
  statCard:       { borderRadius:'10px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', transition:'all 0.2s ease', border:'2px solid transparent', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  statIcon:       { width:'36px', height:'36px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 },
  statNum:        { fontSize:'20px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'600', marginTop:'2px' },
  tab:            { padding:'6px 16px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer', transition:'all 0.2s ease' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  layout:         { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  listPanel:      { display:'flex', flexDirection:'column', gap:'8px', overflowY:'auto', maxHeight:'calc(100vh - 370px)' },
  commCard:       { background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #E2E8F0', cursor:'pointer', transition:'all 0.2s ease', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  commCardActive: { border:'2px solid #2563EB', background:'#F0F7FF' },
  badge:          { fontSize:'8px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', flexShrink:0 },
  detailPanel:    { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', overflowY:'auto', maxHeight:'calc(100vh - 200px)' },
  detailRow:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' },
  detailLabel:    { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  detailValue:    { fontSize:'11px', color:'#1E293B', fontWeight:'500' },
  actionBtn:      { padding:'7px 14px', borderRadius:'6px', border:'none', fontSize:'11px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s ease' },
  noSelection:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:'40px 20px' },
  empty:          { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Communications;