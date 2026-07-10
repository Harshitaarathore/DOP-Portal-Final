import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Requests() {
  const [internalNote, setInternalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null); // FIX 1
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || '';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  //handle_request
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRescheduleForm, setShowRescheduleForm] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      let res;
      if (role === 'Staff') {
        res = await API.get('/meetings/my');
      } else {
        res = await API.get('/meetings/all');
      }
      if (res.data.success) setRequests(res.data.data);
    } catch (err) {
      console.log('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/approve`);
      if (res.data.success) { alert('Request approved!'); fetchRequests(); setSelectedRequest(null); }
    } catch { alert('Failed to approve'); }
  };

const handleReject = async (id) => {
  if (!rejectReason.trim()) { alert('Please provide a reason for rejection'); return; }
  try {
    const res = await API.put(`/meetings/${id}/reject`, { reason: rejectReason });
    if (res.data.success) {
      alert('Request rejected and email sent to requester');
      setShowRejectForm(false);
      setRejectReason('');
      fetchRequests();
      setSelectedRequest(null);
    }
  } catch { alert('Failed to reject'); }
};

const handleReschedule = async (id) => {
  if (!rescheduleData.date || !rescheduleData.time) { alert('New date and time required'); return; }
  try {
    const res = await API.put(`/meetings/${id}/reschedule`, { preferred_date: rescheduleData.date, preferred_time: rescheduleData.time });
    if (res.data.success) {
      alert('Request rescheduled and email sent to requester');
      setShowRescheduleForm(false);
      setRescheduleData({ date: '', time: '' });
      fetchRequests();
      setSelectedRequest(null);
    }
  } catch { alert('Failed to reschedule'); }
};



  const handleSaveNotes = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/notes`, { internal_notes: internalNote });
      if (res.data.success) { setNoteSaved(true); setTimeout(() => setNoteSaved(false), 2000); fetchRequests(); }
    } catch { alert('Failed to save notes'); }
  };

  const filtered = activeTab === 'all' ? requests :
    activeTab === 'pending' ? requests.filter(r => r.status === 'Pending') :
    activeTab === 'approved' ? requests.filter(r => r.status === 'Approved') :
    requests.filter(r => r.status === 'Rejected');

  const priBg    = { High: '#FEE2E2', Medium: '#DBEAFE', Low: '#DCFCE7' };
  const priColor = { High: '#991B1B', Medium: '#1E40AF', Low: '#166534' };
  const stBg     = { Pending: '#FEF3C7', Approved: '#DCFCE7', Rejected: '#FEE2E2', Rescheduled: '#EDE9FE' };
  const stColor  = { Pending: '#92400E', Approved: '#166534', Rejected: '#991B1B', Rescheduled: '#5B21B6' };

  const navItems = role === 'Director' ? [
  { label:'Dashboard', path:'/director-dashboard', icon:'🏠' },
  { label:'Requests',  path:'/requests',           icon:'📋' },
  { label:'Calendar',  path:'/calendar',            icon:'📅' },
  { label:'Settings',  path:'/settings',            icon:'⚙️' },
] : [
  { label:'Dashboard', path:'/dashboard',           icon:'🏠' },
  { label:'Calendar',      path:'/calendar',       icon:'📅' },
  { label:'Requests',      path:'/requests',       icon:'📋' },
  { label:'Documents',     path:'/documents',      icon:'📁' },
  { label:'Visitors',      path:'/visitors',       icon:'👥' },
  { label:'Communication', path:'/communications', icon:'💬' },
  { label:'Tasks',         path:'/tasks',          icon:'✅' },
  { label:'Announcements', path:'/announcements',  icon:'📢' },
  { label:'Reports',       path:'/reports',        icon:'📊' },
  { label:'Audit Logs', path:'/audit-logs', icon:'🕵️' },
  { label:'Settings',      path:'/settings',       icon:'⚙️' },
];

  const stats = [
    { label:'Total',    num: requests.length,                                    bg:'#EFF6FF', color:'#1A3A6B' },
    { label:'Pending',  num: requests.filter(r => r.status==='Pending').length,  bg:'#FEF3C7', color:'#92400E' },
    { label:'Approved', num: requests.filter(r => r.status==='Approved').length, bg:'#DCFCE7', color:'#166534' },
    { label:'Rejected', num: requests.filter(r => r.status==='Rejected').length, bg:'#FEE2E2', color:'#991B1B' },
  ];

  return (
    <div style={S.page}>

      {/* SIDEBAR — identical structure to Calendar.js */}
      <div style={S.sidebar}>
        {/* FIX 2 & 3: removed sidebarFooter, matched Calendar sidebar exactly */}
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
            style={{
              ...S.navItem,
              ...(item.path === window.location.pathname ? S.navActive : {}),
              ...(hoveredNav === i && item.path !== window.location.pathname ? { background:'#F8FAFC', color:'#1A3A6B' } : {})
            }}
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
            {/* <button style={S.btnOutline} onClick={() => navigate(role === 'Director' ? '/director-dashboard' : '/dashboard')}>← Dashboard</button> */}
            <button style={S.btnLogout} onClick={handleLogout}>⏻ Logout</button>
          </div>
        </div>

        <div style={S.content}>
          <div style={S.pageHeader}>
            <div>
              <div style={S.pageTitle}>📋 Requests</div>
              <div style={S.pageSub}>
                {role === 'Director' ? 'You can approve or reject requests' :
                  role === 'Secretary' ? 'Review and approve or reject incoming requests' :
                  'Your submitted requests'}
              </div>
            </div>
          </div>

          {/* STAT ROW — FIX 1: hover effect */}
          <div style={S.statRow}>
            {stats.map((s, i) => (
              <div key={i}
                style={{
                  ...S.statCard,
                  background: s.bg,
                  transform: hoveredStat === i ? 'translateY(-2px)' : 'none',
                  boxShadow: hoveredStat === i ? '0 6px 16px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredStat(i)}
                onMouseLeave={() => setHoveredStat(null)}
              >
                <div style={{ ...S.statNum, color: s.color }}>{s.num}</div>
                <div style={S.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={S.tabs}>
            {['all', 'pending', 'approved', 'rejected'].map(tab => (
              <div key={tab}
                style={{ ...S.tab, ...(activeTab === tab ? S.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          <div style={S.layout}>
            {/* LEFT - REQUEST LIST */}
            <div style={S.listPanel}>
              {loading ? (
                <div style={S.emptyMsg}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div style={S.emptyMsg}>No requests found</div>
              ) : filtered.map(req => (
                <div key={req.id}
                  style={{ ...S.reqCard, ...(selectedRequest?.id === req.id ? S.reqCardActive : {}) }}
                  onClick={() => { setSelectedRequest(req); setShowRescheduleForm(false); setRescheduleData({ date: '', time: '' }); }}
                >
                  <div style={S.reqTop}>
                    <div style={{ ...S.reqAvatar, background:'#1A3A6B' }}>
                      {req.requester_name ? req.requester_name[0].toUpperCase() : 'R'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={S.reqName}>{req.requester_name || 'Unknown'}</div>
                      <div style={S.reqDept}>{req.department || 'No department'} · {req.purpose ? req.purpose.slice(0,20)+'...' : ''}</div>
                    </div>
                    <span style={{ ...S.badge2, background:stBg[req.status], color:stColor[req.status] }}>{req.status}</span>
                  </div>
                  <div style={S.reqMid}>
                    <span style={S.reqType}>Meeting Request</span>
                    <span style={{ ...S.badge2, background:priBg[req.priority], color:priColor[req.priority] }}>{req.priority}</span>
                  </div>
                  <div style={S.reqDate}>📅 {req.preferred_time || 'No time specified'}</div>
                </div>
              ))}
            </div>

            {/* RIGHT - REQUEST DETAIL */}
            <div style={S.detailPanel}>
              {selectedRequest ? (
                <>
                  <div style={S.detailHeader}>
                    <div style={{ ...S.reqAvatar, width:'44px', height:'44px', fontSize:'14px', background:'#1A3A6B' }}>
                      {selectedRequest.purpose ? selectedRequest.purpose[0].toUpperCase() : 'R'}
                    </div>
                    <div>
                      <div style={S.detailName}>{selectedRequest.requester_name || 'Unknown'}</div>
                      <div style={S.detailDept}>{selectedRequest.department || 'No department'}</div>
                    </div>
                  </div>
                  <div style={S.detailRow}>
                    <span style={S.detailLabel}>Priority</span>
                    <span style={{ ...S.badge2, background:priBg[selectedRequest.priority], color:priColor[selectedRequest.priority] }}>{selectedRequest.priority}</span>
                  </div>
                  <div style={S.detailRow}>
                    <span style={S.detailLabel}>Status</span>
                    <span style={{ ...S.badge2, background:stBg[selectedRequest.status], color:stColor[selectedRequest.status] }}>{selectedRequest.status}</span>
                  </div>
                  <div style={S.detailRow}>
                    <span style={S.detailLabel}>Preferred Date</span>
                    <span style={S.detailValue}>{selectedRequest.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div style={S.detailRow}>
                    <span style={S.detailLabel}>Preferred Time</span>
                    <span style={S.detailValue}>{selectedRequest.preferred_time || 'N/A'}</span>
                  </div>
                  <div style={S.detailDesc}>
                    <div style={S.detailLabel}>Purpose</div>
                    <div style={S.descText}>{selectedRequest.purpose}</div>
                    {role === 'Secretary' && (
                      <div style={{ marginTop:'14px' }}>
                        <div style={S.detailLabel}>🔒 Internal Notes (hidden from requester)</div>
                        <textarea
                          style={{ ...S.descText, width:'100%', marginTop:'6px', resize:'vertical', height:'60px', outline:'none', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'8px', fontSize:'11px', boxSizing:'border-box' }}
                          placeholder="Add internal notes..."
                          value={internalNote || selectedRequest.internal_notes || ''}
                          onChange={e => setInternalNote(e.target.value)}
                        />
                        <button style={{ ...S.forwardBtn, marginTop:'6px', background:'#475569' }} onClick={() => handleSaveNotes(selectedRequest.id)}>
                          {noteSaved ? '✓ Saved!' : 'Save Notes'}
                        </button>
                      </div>
                    )}
                    {role === 'Director' && selectedRequest.internal_notes && (
                      <div style={{ marginTop:'14px' }}>
                        <div style={S.detailLabel}>🔒 Internal Notes</div>
                        <div style={S.descText}>{selectedRequest.internal_notes}</div>
                      </div>
                    )}
                  </div>
                  {/* Secretary: full actions */}
{selectedRequest.status === 'Pending' && role === 'Secretary' && (
  <div style={S.actionNote}>
    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
      <button style={S.approveBtn} onClick={() => handleApprove(selectedRequest.id)}>✓ Approve</button>
      <button style={{ ...S.rejectBtn, flex: 0.8 }} onClick={() => { setShowRejectForm(!showRejectForm); setShowRescheduleForm(false); }}>✗ Reject</button>
      <button style={{ ...S.rejectBtn, background: '#1A3A6B', flex: 0.8 }} onClick={() => { setShowRescheduleForm(!showRescheduleForm); setShowRejectForm(false); }}>🔄 Reschedule</button>
    </div>

    {showRejectForm && (
      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', marginTop: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#991B1B', marginBottom: '6px' }}>Reason for Rejection *</div>
        <textarea style={{ width: '100%', border: '1px solid #FECACA', borderRadius: '6px', padding: '8px', fontSize: '11px', resize: 'vertical', height: '60px', outline: 'none', boxSizing: 'border-box' }}
          placeholder="Will be emailed to requester" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button style={{ ...S.rejectBtn, flex: 1 }} onClick={() => handleReject(selectedRequest.id)}>Confirm Reject</button>
          <button style={{ ...S.rejectBtn, background: '#64748B', flex: 0.5 }} onClick={() => { setShowRejectForm(false); setRejectReason(''); }}>Cancel</button>
        </div>
      </div>
    )}

    {showRescheduleForm && (
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '12px', marginTop: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#1E40AF', marginBottom: '8px' }}>New Date & Time *</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="date" style={{ flex: 1, border: '1px solid #BFDBFE', borderRadius: '6px', padding: '8px', fontSize: '11px', outline: 'none' }}
            min={new Date().toISOString().split('T')[0]} value={rescheduleData.date} onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })} />
          <input type="time" style={{ flex: 1, border: '1px solid #BFDBFE', borderRadius: '6px', padding: '8px', fontSize: '11px', outline: 'none' }}
            value={rescheduleData.time} onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button style={{ ...S.approveBtn, flex: 1 }} onClick={() => handleReschedule(selectedRequest.id)}>Confirm Reschedule</button>
          <button style={{ ...S.rejectBtn, background: '#64748B', flex: 0.5 }} onClick={() => { setShowRescheduleForm(false); setRescheduleData({ date: '', time: '' }); }}>Cancel</button>
        </div>
      </div>
    )}
  </div>
)}

{/* Director: read-only */}
{selectedRequest.status === 'Pending' && role === 'Director' && (
  <div style={S.actionNote}>
    <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 13px', fontSize: '11px', color: '#92400E', marginTop: '16px' }}>
      ℹ️ The Director's Office handles approvals, rejections and rescheduling.
    </div>
  </div>
)}

{/* Show rejection reason */}
{selectedRequest.status === 'Rejected' && selectedRequest.rejection_reason && (
  <div style={{ marginTop: '16px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 13px', fontSize: '11px', color: '#991B1B' }}>
    ❌ Rejected — Reason: {selectedRequest.rejection_reason}
  </div>
)}
                </>
              ) : (
                <div style={S.noSelection}>
                  <div style={{ fontSize:'32px', marginBottom:'10px' }}>📋</div>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'#1E293B' }}>Select a request</div>
                  <div style={{ fontSize:'11px', color:'#94A3B8', marginTop:'4px' }}>Click any request to view details</div>
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
  // Sidebar — exact copy of Calendar.js sidebar styles
  sidebar:        { width:'200px', background:'#fff', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto', borderRight:'1px solid #E2E8F0', boxShadow:'1px 0 4px rgba(0,0,0,0.06)' },
  logoWrap:       { padding:'14px 16px 12px', borderBottom:'1px solid #E2E8F0', display:'flex', justifyContent:'center' },
  logo:           { width:'130px', objectFit:'contain' },
  portalBanner:   { padding:'14px 16px' },
  portalName:     { color:'#1A3A6B', fontSize:'13px', fontWeight:'700', lineHeight:1.4, marginBottom:'6px', fontFamily:"'DM Sans',sans-serif" },
  portalDate:     { color:'#64748B', fontSize:'11px', fontWeight:'500', fontFamily:"'DM Sans',sans-serif" },
  divider:        { height:'1px', background:'#E2E8F0', margin:'4px 0' },
  navItem:        { padding:'10px 16px', cursor:'pointer', fontSize:'12px', color:'#475569', fontWeight:'500', borderLeft:'3px solid transparent', transition:'all 0.2s ease', userSelect:'none' },
  navActive:      { background:'#EFF6FF', color:'#1A3A6B', borderLeft:'3px solid #2563EB', fontWeight:'700' },
  navIcon:        { fontSize:'14px', marginRight:'8px', flexShrink:0 },
  // Main
  main:           { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar:         { background:'#fff', padding:'10px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, borderBottom:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
  topbarUser:     { display:'flex', alignItems:'center', gap:'10px' },
  topbarAvatar:   { width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#0EA5E9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0 },
  topbarUserName: { color:'#1A3A6B', fontSize:'13px', fontWeight:'700' },
  topbarUserEmail:{ color:'#94A3B8', fontSize:'9px' },
  topbarUserRole: { color:'#64748B', fontSize:'10px' },
  topbarRight:    { display:'flex', alignItems:'center', gap:'8px' },
  notifWrap:      { position:'relative', background:'#F1F5F9', border:'1px solid #E2E8F0', borderRadius:'6px', padding:'6px 10px', color:'#1A3A6B', fontSize:'14px', cursor:'pointer' },
  btnOutline:     { background:'transparent', color:'#1A3A6B', border:'1px solid #1A3A6B', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  btnLogout:      { background:'#DC2626', color:'#fff', border:'none', borderRadius:'4px', padding:'7px 14px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  // Content
  content:        { flex:1, overflowY:'auto', padding:'16px 20px' },
  pageHeader:     { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' },
  pageTitle:      { fontSize:'16px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'11px', color:'#64748B', marginTop:'2px' },
  // Stats
  statRow:        { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:       { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', border:'1px solid #E2E8F0' },
  statNum:        { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:      { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  // Tabs
  tabs:           { display:'flex', gap:'4px', marginBottom:'14px', background:'#F1F5F9', padding:'4px', borderRadius:'8px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:            { padding:'7px 18px', borderRadius:'6px', fontSize:'12px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  // Layout
  layout:         { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  listPanel:      { display:'flex', flexDirection:'column', gap:'8px', overflowY:'auto', maxHeight:'calc(100vh - 280px)' },
  // Request cards
  reqCard:        { background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #E2E8F0', cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' },
  reqCardActive:  { border:'2px solid #2563EB', background:'#EFF6FF' },
  reqTop:         { display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' },
  reqAvatar:      { width:'34px', height:'34px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  reqName:        { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  reqDept:        { fontSize:'10px', color:'#94A3B8' },
  reqMid:         { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' },
  reqType:        { fontSize:'11px', color:'#475569', fontWeight:'500' },
  reqDate:        { fontSize:'10px', color:'#94A3B8' },
  badge2:         { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },
  // Detail panel
  detailPanel:    { background:'#fff', borderRadius:'10px', border:'1px solid #E2E8F0', padding:'18px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflowY:'auto', maxHeight:'calc(100vh - 200px)' },
  detailHeader:   { display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', paddingBottom:'14px', borderBottom:'1px solid #F1F5F9' },
  detailName:     { fontSize:'14px', fontWeight:'700', color:'#1E293B' },
  detailDept:     { fontSize:'11px', color:'#94A3B8', marginTop:'2px' },
  detailRow:      { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' },
  detailLabel:    { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  detailValue:    { fontSize:'11px', color:'#1E293B', fontWeight:'500' },
  detailDesc:     { marginTop:'14px' },
  descText:       { fontSize:'11px', color:'#475569', lineHeight:1.7, marginTop:'6px', background:'#F8FAFC', padding:'12px', borderRadius:'8px' },
  actionNote:     { marginTop:'16px' },
  noteBox:        { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#92400E', lineHeight:1.6, marginBottom:'12px' },
  approveBtn:     { flex:1, background:'#166534', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  rejectBtn:      { flex:1, background:'#991B1B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  forwardBtn:     { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  noSelection:    { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94A3B8' },
  emptyMsg:       { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Requests;
