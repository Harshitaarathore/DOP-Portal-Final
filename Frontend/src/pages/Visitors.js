import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import { useNotifCount } from '../hooks/useNotifCount';

// Toast component
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === 'success' ? '#166534' : type === 'error' ? '#991B1B' : '#1A3A6B';
  return (
    <div style={{ position:'fixed', top:'20px', right:'20px', background:bg, color:'#fff', padding:'12px 20px', borderRadius:'8px', fontSize:'13px', fontWeight:'600', zIndex:9999, boxShadow:'0 4px 12px rgba(0,0,0,0.15)', display:'flex', alignItems:'center', gap:'8px', animation:'slideDown 0.3s ease' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} {message}
    </div>
  );
}

function Visitors() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ name:'', organization:'', purpose:'', visit_date:'', visit_time:'' });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);

  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const canManage = role === 'Secretary' || role === 'Director';
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const [submitting, setSubmitting] = useState(false);
  const { count: notifCount } = useNotifCount();

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => { fetchVisitors(); }, []);

  const fetchVisitors = async () => {
    try {
      const res = await API.get('/visitors/today');
      if (res.data.success) setVisitors(res.data.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
  if (submitting) return;
  setSubmitting(true);
  try {
    const res = await API.put(`/visitors/${id}/approve`);
    if (res.data.success) {
      showToast('Visitor approved and pass generated!', 'success');
      fetchVisitors();
      setSelectedVisitor(prev => ({ ...prev, approval_status:'Approved', pass_generated:1 }));
    } else { 
      showToast(res.data.message, 'error'); // will show the clash message
    }
  } catch { showToast('Failed to approve visitor', 'error'); }
  finally { setSubmitting(false); }
};

  const handleReject = async (id) => {
    try {
      const res = await API.put(`/visitors/${id}/reject`);
      if (res.data.success) {
        showToast('Visitor rejected', 'error');
        fetchVisitors();
        setSelectedVisitor(prev => ({ ...prev, approval_status:'Rejected' }));
      } else { showToast(res.data.message, 'error'); }
    } catch { showToast('Failed to reject visitor', 'error'); }
  };

  const handleAddVisitor = async () => {
  if (submitting) return;
  setFormError('');

  // Validate first — before setting submitting
  if (!newVisitor.name.trim()) { setFormError('Visitor name is required'); return; }
  if (!newVisitor.purpose.trim()) { setFormError('Purpose is required'); return; }
  if (!newVisitor.visit_date) { setFormError('Visit date is required'); return; }
  if (!newVisitor.visit_time) { setFormError('Visit time is required'); return; }

  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  if (new Date(newVisitor.visit_date) < todayDate) { setFormError('Visit date cannot be in the past'); return; }

  const clash = visitors.find(v => {
    if (v.visit_date !== newVisitor.visit_date) return false;
    return v.visit_time === newVisitor.visit_time && v.approval_status !== 'Rejected';
  });
  if (clash) { setFormError(`Time conflict with visitor "${clash.name}" at ${clash.visit_time}`); return; }

  // Only set submitting AFTER all validation passes
  setSubmitting(true);
  try {
    const res = await API.post('/visitors/request', newVisitor);
    if (res.data.success) {
      showToast('Visitor request submitted successfully!', 'success');
      setShowAddForm(false);
      setNewVisitor({ name:'', organization:'', purpose:'', visit_date:'', visit_time:'' });
      fetchVisitors();
    } else { setFormError(res.data.message); }
  } catch { setFormError('Failed to submit visitor request'); }
  finally { setSubmitting(false); }
};

  const handlePrintPass = (visitor) => {
    const passContent = `<html><head><style>body{font-family:Arial,sans-serif;padding:40px}.pass{border:3px solid #1A3A6B;border-radius:12px;padding:30px;max-width:400px;margin:auto}.header{background:#1A3A6B;color:white;padding:16px;border-radius:8px;text-align:center;margin-bottom:20px}.title{font-size:20px;font-weight:bold}.sub{font-size:12px;opacity:.8;margin-top:4px}.field{margin-bottom:12px}.label{font-size:11px;color:#64748B;font-weight:bold;text-transform:uppercase}.value{font-size:14px;color:#1E293B;font-weight:600;margin-top:2px}.badge{background:#DCFCE7;color:#166534;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:bold;display:inline-block;margin-top:16px}.footer{margin-top:20px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:10px;color:#94A3B8;text-align:center}</style></head><body><div class="pass"><div class="header"><div class="title">LNMIIT — Entry Pass</div><div class="sub">Director's Office Portal</div></div><div class="field"><div class="label">Visitor Name</div><div class="value">${visitor.name}</div></div><div class="field"><div class="label">Organization</div><div class="value">${visitor.organization||'N/A'}</div></div><div class="field"><div class="label">Purpose</div><div class="value">${visitor.purpose}</div></div><div class="field"><div class="label">Visit Date</div><div class="value">${new Date(new Date(visitor.visit_date).getTime()+new Date(visitor.visit_date).getTimezoneOffset()*60000).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div><div class="field"><div class="label">Visit Time</div><div class="value">${visitor.visit_time||'10:00'}</div></div><div class="badge">✓ APPROVED</div><div class="footer">This pass is valid for the mentioned date only.<br/>Issued by: Director's Office, LNMIIT Jaipur</div></div></body></html>`;
    const win = window.open('','_blank');
    win.document.write(passContent);
    win.document.close();
    win.print();
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const filtered = activeTab === 'all' ? visitors
    : visitors.filter(v => v.approval_status.toLowerCase() === activeTab);

  const stBg    = { Approved:'#DCFCE7', Pending:'#FEF3C7', Rejected:'#FEE2E2' };
  const stColor = { Approved:'#166534', Pending:'#92400E', Rejected:'#991B1B' };

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
            <div style={S.notifWrap} onClick={() => navigate('/notifications')}>
  🔔
  {notifCount > 0 && <span style={S.notifBadge}>{notifCount}</span>}
</div>
            <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button>
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={S.content}>

          {/* PAGE HEADER */}
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>👥 Visitors</div>
              <div style={S.pageSub}>Manage and track all visitor appointments</div>
            </div>
            <button style={S.addBtn} onClick={() => { setShowAddForm(!showAddForm); setFormError(''); }}>
              + Add Visitor
            </button>
          </div>

          {/* ADD VISITOR FORM */}
          {showAddForm && (
            <div style={S.addForm}>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <input style={{ ...S.input, flex:2 }} placeholder="Visitor name *" value={newVisitor.name} onChange={e => setNewVisitor({...newVisitor, name:e.target.value})} />
                <input style={{ ...S.input, flex:2 }} placeholder="Organization" value={newVisitor.organization} onChange={e => setNewVisitor({...newVisitor, organization:e.target.value})} />
                <input style={{ ...S.input, flex:3 }} placeholder="Purpose of visit *" value={newVisitor.purpose} onChange={e => setNewVisitor({...newVisitor, purpose:e.target.value})} />
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <input style={{ ...S.input, flex:1 }} type="date" value={newVisitor.visit_date} onChange={e => setNewVisitor({...newVisitor, visit_date:e.target.value})} />
                <input style={{ ...S.input, flex:1 }} type="time" value={newVisitor.visit_time} onChange={e => setNewVisitor({...newVisitor, visit_time:e.target.value})} />
              </div>
              {formError && <div style={S.errorMsg}>⚠️ {formError}</div>}
              <div style={{ display:'flex', gap:'8px' }}>
                <button style={{ ...S.addBtn, opacity: submitting ? 0.6 : 1 }} onClick={handleAddVisitor} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button style={{ ...S.addBtn, background:'#64748B' }} onClick={() => { setShowAddForm(false); setFormError(''); }}>Cancel</button>
              </div>
            </div>
          )}

          {/* STAT CARDS */}
          <div style={S.statRow}>
            {[
              { label:'Total',    num:visitors.length, bg:'#EFF6FF', color:'#1A3A6B', tab:'all' },
              { label:'Approved', num:visitors.filter(v=>v.approval_status==='Approved').length, bg:'#DCFCE7', color:'#166534', tab:'approved' },
              { label:'Pending',  num:visitors.filter(v=>v.approval_status==='Pending').length,  bg:'#FEF3C7', color:'#92400E', tab:'pending' },
              { label:'Rejected', num:visitors.filter(v=>v.approval_status==='Rejected').length, bg:'#FEE2E2', color:'#991B1B', tab:'rejected' },
            ].map((s, i) => (
              <div key={i}
                style={{
                  ...S.statCard,
                  background: s.bg,
                  ...(hoveredStat === i ? { boxShadow:'0 4px 12px rgba(0,0,0,0.1)', transform:'translateY(-2px)' } : {}),
                  ...(activeTab === s.tab ? { border:`2px solid ${s.color}` } : {})
                }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
                onClick={() => setActiveTab(s.tab)}
              >
                <div style={{ ...S.statNum, color:s.color }}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={S.tabs}>
            {['all','approved','pending','rejected'].map(tab => (
              <div key={tab}
                style={{ ...S.tab, ...(activeTab === tab ? S.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </div>
            ))}
          </div>

          {/* LAYOUT */}
          <div style={S.layout}>

            {/* LEFT — VISITOR LIST */}
            <div style={S.listPanel}>
              {loading ? (
                <div style={S.emptyMsg}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div style={S.emptyMsg}>No visitors found</div>
              ) : filtered.map((v, idx) => (
                <div key={v.id}
                  style={{
                    ...S.visitorCard,
                    ...(selectedVisitor?.id === v.id ? S.visitorCardActive : {}),
                    ...(hoveredCard === idx && selectedVisitor?.id !== v.id ? { boxShadow:'0 4px 12px rgba(0,0,0,0.08)', transform:'translateY(-1px)' } : {})
                  }}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setSelectedVisitor(v)}
                >
                  <div style={S.visitorTop}>
                    <div style={S.visitorAvatar}>{v.name?.[0]?.toUpperCase()||'V'}</div>
                    <div style={{ flex:1 }}>
                      <div style={S.visitorName}>{v.name}</div>
                      <div style={S.visitorOrg}>{v.organization}</div>
                    </div>
                    <span style={{ ...S.statusBadge, background:stBg[v.approval_status], color:stColor[v.approval_status] }}>
                      {v.approval_status}
                    </span>
                  </div>
                  <div style={{ fontSize:'11px', color:'#475569', marginBottom:'6px' }}>{v.purpose}</div>
                  <div style={{ fontSize:'10px', color:'#94A3B8', display:'flex', gap:'10px' }}>
                    <span>📅 {v.visit_date ? new Date(new Date(v.visit_date).getTime()+new Date(v.visit_date).getTimezoneOffset()*60000).toLocaleDateString('en-IN') : 'No date'}</span>
                    {v.visit_time && <span>🕐 {v.visit_time}</span>}
                    <span>🎫 Pass: {v.pass_generated ? 'Generated':'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — VISITOR DETAIL */}
            <div style={S.detailPanel}>
              {selectedVisitor ? (
                <>
                  <div style={S.detailHeader}>
                    <div style={S.detailAvatar}>{selectedVisitor.name?.[0]?.toUpperCase()||'V'}</div>
                    <div>
                      <div style={S.detailName}>{selectedVisitor.name}</div>
                      <div style={S.detailOrg}>{selectedVisitor.organization}</div>
                    </div>
                    <span style={{ ...S.statusBadge, background:stBg[selectedVisitor.approval_status], color:stColor[selectedVisitor.approval_status], marginLeft:'auto' }}>
                      {selectedVisitor.approval_status}
                    </span>
                  </div>

                  {[
                    { label:'Purpose',        value: selectedVisitor.purpose },
                    { label:'Visit Date',     value: selectedVisitor.visit_date ? new Date(new Date(selectedVisitor.visit_date).getTime()+new Date(selectedVisitor.visit_date).getTimezoneOffset()*60000).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : 'N/A' },
                    { label:'Visit Time',     value: selectedVisitor.visit_time || '10:00' },
                    { label:'Pass Generated', value: selectedVisitor.pass_generated ? '✅ Yes' : '❌ No' },
                  ].map((row, i) => (
                    <div key={i} style={S.detailRow}>
                      <span style={S.detailLabel}>{row.label}</span>
                      <span style={S.detailValue}>{row.value}</span>
                    </div>
                  ))}

                  {selectedVisitor.approval_status === 'Pending' && canManage && (
                    <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
                      <button style={S.approveBtn} onClick={() => handleApprove(selectedVisitor.id)}>✓ Approve & Generate Pass</button>
                      <button style={S.rejectBtn} onClick={() => handleReject(selectedVisitor.id)}>✗ Reject</button>
                    </div>
                  )}

                  {selectedVisitor.approval_status === 'Approved' && selectedVisitor.pass_generated && (
                    <div style={{ marginTop:'16px' }}>
                      <div style={{ background:'#DCFCE7', border:'1px solid #86EFAC', borderRadius:'8px', padding:'10px 12px', fontSize:'11px', color:'#166534', marginBottom:'10px' }}>
                        ✅ Visitor approved. Entry pass has been generated.
                      </div>
                      <button style={{ background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'6px', padding:'10px', fontSize:'12px', fontWeight:'700', cursor:'pointer', width:'100%' }}
                        onClick={() => handlePrintPass(selectedVisitor)}>
                        🖨️ Print Entry Pass
                      </button>
                    </div>
                  )}

                  {selectedVisitor.approval_status === 'Rejected' && (
                    <div style={{ marginTop:'16px', background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:'8px', padding:'10px 12px', fontSize:'11px', color:'#991B1B' }}>
                      ❌ This visitor request has been rejected.
                    </div>
                  )}
                </>
              ) : (
                <div style={S.noSelection}>
                  <div style={{ fontSize:'40px', marginBottom:'10px' }}>👥</div>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'#1E293B' }}>Select a visitor</div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'4px' }}>Click any visitor card to view details</div>
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
  notifBadge: { position:'absolute', top:'-5px', right:'-5px', background:'#EF4444', color:'#fff', borderRadius:'50%', width:'14px', height:'14px', fontSize:'8px', fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center' },
notifWrap:  { position:'relative', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:'6px', padding:'6px 10px', color:'#1A3A6B', fontSize:'14px', cursor:'pointer' },
  btnOutline:     { background:'transparent', color:'#1A3A6B', border:'1px solid #1A3A6B', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  btnLogout:      { background:'#DC2626', color:'#fff', border:'none', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  addBtn:         { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'4px', padding:'8px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  addForm:        { background:'#fff', borderRadius:'10px', padding:'16px', border:'1px solid #E2E8F0', marginBottom:'14px', display:'flex', flexDirection:'column', gap:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  input:          { padding:'8px 12px', borderRadius:'4px', border:'1px solid #E2E8F0', fontSize:'12px', outline:'none', fontFamily:"'DM Sans',sans-serif" },
  errorMsg:       { color:'#DC2626', fontSize:'11px', background:'#FEE2E2', border:'1px solid #FECACA', borderRadius:'4px', padding:'6px 10px' },
  statRow:        { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:       { borderRadius:'10px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', transition:'all 0.2s ease', border:'2px solid transparent', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' },
  statNum:        { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'600' },
  tabs:           { display:'flex', gap:'4px', marginBottom:'14px', background:'#fff', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:            { padding:'6px 16px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer', transition:'all 0.2s ease' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  layout:         { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  listPanel:      { display:'flex', flexDirection:'column', gap:'8px', overflowY:'auto', maxHeight:'calc(100vh - 340px)' },
  visitorCard:    { background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #E2E8F0', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', transition:'all 0.2s ease' },
  visitorCardActive:{ border:'2px solid #2563EB', background:'#F0F7FF' },
  visitorTop:     { display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' },
  visitorAvatar:  { width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#1A3A6B,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#fff', flexShrink:0 },
  visitorName:    { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  visitorOrg:     { fontSize:'10px', color:'#94A3B8' },
  statusBadge:    { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },
  detailPanel:    { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', overflowY:'auto', maxHeight:'calc(100vh - 200px)' },
  detailHeader:   { display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px', paddingBottom:'14px', borderBottom:'1px solid #F1F5F9' },
  detailAvatar:   { width:'44px', height:'44px', borderRadius:'50%', background:'linear-gradient(135deg,#1A3A6B,#2563EB)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:'700', color:'#fff', flexShrink:0 },
  detailName:     { fontSize:'14px', fontWeight:'700', color:'#1E293B' },
  detailOrg:      { fontSize:'11px', color:'#94A3B8', marginTop:'2px' },
  detailRow:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #F8FAFC' },
  detailLabel:    { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  detailValue:    { fontSize:'11px', color:'#1E293B', fontWeight:'500', textAlign:'right', maxWidth:'60%' },
  approveBtn:     { flex:1, background:'#166534', color:'#fff', border:'none', borderRadius:'6px', padding:'10px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  rejectBtn:      { flex:1, background:'#DC2626', color:'#fff', border:'none', borderRadius:'6px', padding:'10px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  noSelection:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94A3B8', padding:'40px 20px', textAlign:'center' },
  emptyMsg:       { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Visitors;