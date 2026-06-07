import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function DirectorRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/meetings/all');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      // fallback dummy data
      setRequests([
        { id:1, requester_name:'Dr. Sharma',      department:'Computer Science', purpose:'Meeting Request',  created_at:'2026-05-24', priority:'High',   status:'Pending',  description:'Requesting a meeting to discuss new curriculum changes.' },
        { id:2, requester_name:'Prof. Mehta',      department:'Electronics',      purpose:'Leave Approval',   created_at:'2026-05-23', priority:'Medium', status:'Pending',  description:'Applying for 3 days leave for IEEE conference.' },
        { id:3, requester_name:'Registrar Office', department:'Admin',            purpose:'Document Sign',    created_at:'2026-05-22', priority:'High',   status:'Pending',  description:'Urgent signature required on UGC documents.' },
        { id:4, requester_name:'Prof. Agarwal',    department:'Mechanical',       purpose:'Research Fund',    created_at:'2026-05-21', priority:'Low',    status:'Approved', description:'Research funding request for lab equipment.' },
        { id:5, requester_name:'Dr. N. Kumar',     department:'Physics',          purpose:'Meeting Request',  created_at:'2026-05-20', priority:'Medium', status:'Rejected', description:'Meeting request for PhD admission process.' },
      ]);
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/approve`);
      if (res.data.success) {
        setActionMsg('✅ Request approved! Email sent to requester.');
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err) {
      setActionMsg('✅ Request approved! (Demo mode)');
      setRequests(prev => prev.map(r => r.id === id ? {...r, status:'Approved'} : r));
      setSelectedRequest(null);
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleReject = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/reject`);
      if (res.data.success) {
        setActionMsg('❌ Request rejected! Email sent to requester.');
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err) {
      setActionMsg('❌ Request rejected! (Demo mode)');
      setRequests(prev => prev.map(r => r.id === id ? {...r, status:'Rejected'} : r));
      setSelectedRequest(null);
    }
    setTimeout(() => setActionMsg(''), 3000);
  };

  const filtered = activeTab === 'all' ? requests :
                   requests.filter(r => r.status?.toLowerCase() === activeTab);

  const priBg    = { High:'#FEE2E2', Medium:'#DBEAFE', Low:'#DCFCE7' };
  const priColor = { High:'#991B1B', Medium:'#1E40AF', Low:'#166534' };
  const stBg     = { Pending:'#FEF3C7', Approved:'#DCFCE7', Rejected:'#FEE2E2' };
  const stColor  = { Pending:'#92400E', Approved:'#166534', Rejected:'#991B1B' };

  const getInitials = (name) => name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) : 'NA';
  const avatarColors = ['#1A3A6B','#2563EB','#0EA5E9','#7C3AED','#059669','#DC2626'];

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
          {label:'Dashboard',  path:'/director-dashboard'},
          {label:'Requests',   path:'/director-requests'},
          {label:'Calendar',   path:'/calendar'},
          {label:'Documents',  path:'/documents'},
          {label:'Visitors',   path:'/visitors'},
          {label:'Tasks',      path:'/tasks'},
          {label:'Reports',    path:'/reports'},
          {label:'Settings',   path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(i===1 ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>{localStorage.getItem('name')?.split(' ').map(n=>n[0]).join('').toUpperCase() || 'DR'}</div>
<div style={{flex:1}}>
  <div style={styles.userName}>{localStorage.getItem('name') || 'Director'}</div>
  <div style={styles.userRole}>Director</div>
</div>
          <div style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.topbarSub}>Director's View</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 Director ▾</div>
          </div>
        </div>

        <div style={styles.content}>

          {/* HEADER */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📋 Requests — Director View</div>
              <div style={styles.pageSub}>Only you can approve or reject requests</div>
            </div>
            {actionMsg && <div style={styles.actionMsg}>{actionMsg}</div>}
          </div>

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              {label:'Total',    num:requests.length,                                          bg:'#EFF6FF', color:'#1A3A6B'},
              {label:'Pending',  num:requests.filter(r=>r.status==='Pending').length,          bg:'#FEF3C7', color:'#92400E'},
              {label:'Approved', num:requests.filter(r=>r.status==='Approved').length,         bg:'#DCFCE7', color:'#166534'},
              {label:'Rejected', num:requests.filter(r=>r.status==='Rejected').length,         bg:'#FEE2E2', color:'#991B1B'},
            ].map((s,i) => (
              <div key={i} style={{...styles.statCard, background:s.bg}}>
                <div style={{...styles.statNum, color:s.color}}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={styles.tabs}>
            {['all','pending','approved','rejected'].map(tab => (
              <div key={tab}
                style={{...styles.tab, ...(activeTab===tab ? styles.tabActive : {})}}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>

          {/* LAYOUT */}
          <div style={styles.layout}>

            {/* LEFT — LIST */}
            <div style={styles.listPanel}>
              {loading ? (
                <div style={styles.loading}>Loading requests...</div>
              ) : filtered.length === 0 ? (
                <div style={styles.loading}>No requests found</div>
              ) : (
                filtered.map((req, i) => (
                  <div key={req.id}
                    style={{...styles.reqCard, ...(selectedRequest?.id===req.id ? styles.reqCardActive : {})}}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <div style={styles.reqTop}>
                      <div style={{...styles.reqAvatar, background:avatarColors[i % avatarColors.length]}}>
                        {getInitials(req.requester_name)}
                      </div>
                      <div style={{flex:1}}>
                        <div style={styles.reqName}>{req.requester_name}</div>
                        <div style={styles.reqDept}>{req.department}</div>
                      </div>
                      <span style={{...styles.badge2, background:stBg[req.status], color:stColor[req.status]}}>{req.status}</span>
                    </div>
                    <div style={styles.reqMid}>
                      <span style={styles.reqType}>{req.purpose}</span>
                      <span style={{...styles.badge2, background:priBg[req.priority], color:priColor[req.priority]}}>{req.priority}</span>
                    </div>
                    <div style={styles.reqDate}>📅 {req.created_at?.split('T')[0]}</div>

                    {/* QUICK ACTION BUTTONS */}
                    {req.status === 'Pending' && (
                      <div style={styles.quickBtns}>
                        <button style={styles.approveBtn} onClick={(e) => { e.stopPropagation(); handleApprove(req.id); }}>✓ Approve</button>
                        <button style={styles.rejectBtn}  onClick={(e) => { e.stopPropagation(); handleReject(req.id); }}>✗ Reject</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* RIGHT — DETAIL */}
            <div style={styles.detailPanel}>
              {selectedRequest ? (
                <>
                  <div style={styles.detailHeader}>
                    <div style={{...styles.reqAvatar, width:'44px', height:'44px', fontSize:'14px', background:'#1A3A6B'}}>
                      {getInitials(selectedRequest.requester_name)}
                    </div>
                    <div>
                      <div style={styles.detailName}>{selectedRequest.requester_name}</div>
                      <div style={styles.detailDept}>{selectedRequest.department}</div>
                    </div>
                  </div>

                  {[
                    {label:'Request Type',   value: selectedRequest.purpose},
                    {label:'Date Submitted', value: selectedRequest.created_at?.split('T')[0]},
                    {label:'Priority',       value: <span style={{...styles.badge2, background:priBg[selectedRequest.priority], color:priColor[selectedRequest.priority]}}>{selectedRequest.priority}</span>},
                    {label:'Status',         value: <span style={{...styles.badge2, background:stBg[selectedRequest.status], color:stColor[selectedRequest.status]}}>{selectedRequest.status}</span>},
                  ].map((row,i) => (
                    <div key={i} style={styles.detailRow}>
                      <span style={styles.detailLabel}>{row.label}</span>
                      <span style={styles.detailValue}>{row.value}</span>
                    </div>
                  ))}

                  <div style={styles.detailDesc}>
                    <div style={styles.detailLabel}>Description</div>
                    <div style={styles.descText}>{selectedRequest.description || selectedRequest.purpose}</div>
                  </div>

                  {selectedRequest.status === 'Pending' && (
                    <div style={styles.actionBox}>
                      <div style={styles.directorNote}>
                        🔒 You are the Director — only you can approve or reject this request.
                        An email will be automatically sent to the requester.
                      </div>
                      <div style={styles.actionBtns}>
                        <button style={styles.approveBtnLg} onClick={() => handleApprove(selectedRequest.id)}>
                          ✓ Approve Request
                        </button>
                        <button style={styles.rejectBtnLg} onClick={() => handleReject(selectedRequest.id)}>
                          ✗ Reject Request
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status !== 'Pending' && (
                    <div style={{...styles.directorNote, background:'#F8FAFC', border:'1px solid #E2E8F0', color:'#64748B'}}>
                      This request has already been {selectedRequest.status.toLowerCase()}.
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.noSelection}>
                  <div style={{fontSize:'32px', marginBottom:'10px'}}>📋</div>
                  <div style={{fontSize:'13px', fontWeight:'600', color:'#1E293B'}}>Select a request</div>
                  <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>Click any request to view details and approve/reject</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
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
  actionMsg:     { background:'#DCFCE7', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'8px 16px', fontSize:'12px', fontWeight:'600' },
  statRow:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:      { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' },
  statNum:       { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  tabs:          { display:'flex', gap:'4px', marginBottom:'14px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:           { padding:'6px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:     { background:'#1A3A6B', color:'#fff' },
  layout:        { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  listPanel:     { display:'flex', flexDirection:'column', gap:'8px', overflowY:'auto', maxHeight:'calc(100vh - 280px)' },
  loading:       { textAlign:'center', padding:'30px', fontSize:'12px', color:'#94A3B8' },
  reqCard:       { background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #E2E8F0', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  reqCardActive: { border:'2px solid #2563EB', background:'#EFF6FF' },
  reqTop:        { display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' },
  reqAvatar:     { width:'34px', height:'34px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  reqName:       { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  reqDept:       { fontSize:'10px', color:'#94A3B8' },
  reqMid:        { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' },
  reqType:       { fontSize:'11px', color:'#475569', fontWeight:'500' },
  reqDate:       { fontSize:'10px', color:'#94A3B8', marginBottom:'8px' },
  badge2:        { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },
  quickBtns:     { display:'flex', gap:'6px' },
  approveBtn:    { flex:1, background:'#DCFCE7', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'6px', padding:'6px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  rejectBtn:     { flex:1, background:'#FEE2E2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:'6px', padding:'6px', fontSize:'11px', fontWeight:'700', cursor:'pointer' },
  detailPanel:   { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflowY:'auto', maxHeight:'calc(100vh - 200px)' },
  detailHeader:  { display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', paddingBottom:'14px', borderBottom:'1px solid #F1F5F9' },
  detailName:    { fontSize:'14px', fontWeight:'700', color:'#1E293B' },
  detailDept:    { fontSize:'11px', color:'#94A3B8', marginTop:'2px' },
  detailRow:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' },
  detailLabel:   { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  detailValue:   { fontSize:'11px', color:'#1E293B', fontWeight:'500' },
  detailDesc:    { marginTop:'14px' },
  descText:      { fontSize:'11px', color:'#475569', lineHeight:1.7, marginTop:'6px', background:'#F8FAFC', padding:'12px', borderRadius:'8px' },
  actionBox:     { marginTop:'16px' },
  directorNote:  { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#92400E', lineHeight:1.6, marginBottom:'12px' },
  actionBtns:    { display:'flex', gap:'8px' },
  approveBtnLg:  { flex:1, background:'#DCFCE7', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  rejectBtnLg:   { flex:1, background:'#FEE2E2', color:'#991B1B', border:'1px solid #FECACA', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  noSelection:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94A3B8' },
};

export default DirectorRequests;