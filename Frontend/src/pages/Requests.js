import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Requests() {
  const [internalNote, setInternalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name') || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  useEffect(() => {
    fetchRequests();
  }, []);

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

  const handleApprove = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/approve`);
      if (res.data.success) {
        alert('Request approved!');
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await API.put(`/meetings/${id}/reject`);
      if (res.data.success) {
        alert('Request rejected!');
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleSaveNotes = async (id) => {
  try {
    const res = await API.put(`/meetings/${id}/notes`, { internal_notes: internalNote });
    if (res.data.success) {
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
      fetchRequests();
    }
  } catch (err) {
    alert('Failed to save notes');
  }
};

  

  const filtered = activeTab === 'all' ? requests :
                   activeTab === 'pending' ? requests.filter(r => r.status === 'Pending') :
                   activeTab === 'approved' ? requests.filter(r => r.status === 'Approved') :
                   requests.filter(r => r.status === 'Rejected');

  const priBg    = { High:'#FEE2E2', Medium:'#DBEAFE', Low:'#DCFCE7' };
  const priColor = { High:'#991B1B', Medium:'#1E40AF', Low:'#166534' };
  const stBg     = { Pending:'#FEF3C7', Approved:'#DCFCE7', Rejected:'#FEE2E2', Rescheduled:'#EDE9FE' };
  const stColor  = { Pending:'#92400E', Approved:'#166534', Rejected:'#991B1B', Rescheduled:'#5B21B6' };

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
            style={{...styles.navItem, ...(i===2 ? styles.navActive : {})}}
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
              <div style={styles.pageTitle}>📋 Requests</div>
              <div style={styles.pageSub}>
                {role === 'Director' ? 'You can approve or reject requests' : 
                 role === 'Secretary' ? 'All incoming requests - only Director can approve or reject' :
                 'Your submitted requests'}
              </div>
            </div>
          </div>

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              {label:'Total',    num: requests.length,                                   bg:'#EFF6FF', color:'#1A3A6B'},
              {label:'Pending',  num: requests.filter(r=>r.status==='Pending').length,   bg:'#FEF3C7', color:'#92400E'},
              {label:'Approved', num: requests.filter(r=>r.status==='Approved').length,  bg:'#DCFCE7', color:'#166534'},
              {label:'Rejected', num: requests.filter(r=>r.status==='Rejected').length,  bg:'#FEE2E2', color:'#991B1B'},
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

          <div style={styles.layout}>
            {/* LEFT - REQUEST LIST */}
            <div style={styles.listPanel}>
              {loading ? (
                <div style={styles.emptyMsg}>Loading...</div>
              ) : filtered.length === 0 ? (
                <div style={styles.emptyMsg}>No requests found</div>
              ) : filtered.map(req => (
                <div key={req.id}
                  style={{...styles.reqCard, ...(selectedRequest?.id === req.id ? styles.reqCardActive : {})}}
                  onClick={() => setSelectedRequest(req)}
                >
                  <div style={styles.reqTop}>
                    <div style={{...styles.reqAvatar, background:'#1A3A6B'}}>
  {req.requester_name ? req.requester_name[0].toUpperCase() : 'R'}
</div>
<div style={{flex:1}}>
  <div style={styles.reqName}>{req.requester_name || 'Unknown'}</div>
  <div style={styles.reqDept}>{req.department || 'No department'} · {req.purpose ? req.purpose.slice(0, 20) + '...' : ''}</div>
</div>
                    <span style={{...styles.badge2, background:stBg[req.status], color:stColor[req.status]}}>{req.status}</span>
                  </div>
                  <div style={styles.reqMid}>
                    <span style={styles.reqType}>Meeting Request</span>
                    <span style={{...styles.badge2, background:priBg[req.priority], color:priColor[req.priority]}}>{req.priority}</span>
                  </div>
                  <div style={styles.reqDate}>📅 {req.preferred_time || 'No time specified'}</div>
                </div>
              ))}
            </div>

            {/* RIGHT - REQUEST DETAIL */}
            <div style={styles.detailPanel}>
              {selectedRequest ? (
                <>
                  <div style={styles.detailHeader}>
                    <div style={{...styles.reqAvatar, width:'44px', height:'44px', fontSize:'14px', background:'#1A3A6B'}}>
                      {selectedRequest.purpose ? selectedRequest.purpose[0].toUpperCase() : 'R'}
                    </div>
                    <div>
                      <div style={styles.detailName}>{selectedRequest.requester_name || 'Unknown'}</div>
                      <div style={styles.detailDept}>{selectedRequest.department || 'No department'}</div>
                    </div>
                  </div>

                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Priority</span>
                    <span style={{...styles.badge2, background:priBg[selectedRequest.priority], color:priColor[selectedRequest.priority]}}>{selectedRequest.priority}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Status</span>
                    <span style={{...styles.badge2, background:stBg[selectedRequest.status], color:stColor[selectedRequest.status]}}>{selectedRequest.status}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Preferred Date</span>
                    <span style={styles.detailValue}>{selectedRequest.preferred_date ? new Date(selectedRequest.preferred_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Preferred Time</span>
                    <span style={styles.detailValue}>{selectedRequest.preferred_time || 'N/A'}</span>
                  </div>

                  <div style={styles.detailDesc}>
                    <div style={styles.detailLabel}>Purpose</div>
                    <div style={styles.descText}>{selectedRequest.purpose}</div>
                    {/* INTERNAL NOTES - Secretary only */}
{role === 'Secretary' && (
  <div style={{marginTop:'14px'}}>
    <div style={styles.detailLabel}>🔒 Internal Notes (hidden from requester)</div>
    <textarea
      style={{...styles.descText, width:'100%', marginTop:'6px', resize:'vertical', height:'60px', outline:'none', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'8px', fontSize:'11px', boxSizing:'border-box'}}
      placeholder="Add internal notes..."
      value={internalNote || selectedRequest.internal_notes || ''}
      onChange={e => setInternalNote(e.target.value)}
    />
    <button style={{...styles.forwardBtn, marginTop:'6px', background:'#475569'}} onClick={() => handleSaveNotes(selectedRequest.id)}>
      {noteSaved ? '✓ Saved!' : 'Save Notes'}
    </button>
  </div>
)}

{/* SHOW EXISTING NOTES for Director */}
{role === 'Director' && selectedRequest.internal_notes && (
  <div style={{marginTop:'14px'}}>
    <div style={styles.detailLabel}>🔒 Internal Notes</div>
    <div style={styles.descText}>{selectedRequest.internal_notes}</div>
  </div>
)}
                  </div>

                  {/* APPROVE/REJECT - Director only */}
                  {selectedRequest.status === 'Pending' && role === 'Director' && (
                    <div style={styles.actionNote}>
                      <div style={{display:'flex', gap:'10px', marginTop:'16px'}}>
                        <button style={styles.approveBtn} onClick={() => handleApprove(selectedRequest.id)}>
                          ✓ Approve
                        </button>
                        <button style={styles.rejectBtn} onClick={() => handleReject(selectedRequest.id)}>
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRequest.status === 'Pending' && role === 'Secretary' && (
                    <div style={styles.actionNote}>
                      <div style={styles.noteBox}>
                        🔒 Only the <strong>Director</strong> can approve or reject this request.
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.noSelection}>
                  <div style={{fontSize:'32px', marginBottom:'10px'}}>📋</div>
                  <div style={{fontSize:'13px', fontWeight:'600', color:'#1E293B'}}>Select a request</div>
                  <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>Click any request to view details</div>
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
  statRow:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:      { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' },
  statNum:       { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  tabs:          { display:'flex', gap:'4px', marginBottom:'14px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:           { padding:'6px 16px', borderRadius:'8px', fontSize:'11px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:     { background:'#1A3A6B', color:'#fff' },
  layout:        { display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'14px' },
  listPanel:     { display:'flex', flexDirection:'column', gap:'8px', overflowY:'auto', maxHeight:'calc(100vh - 280px)' },
  reqCard:       { background:'#fff', borderRadius:'10px', padding:'12px 14px', border:'1px solid #E2E8F0', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  reqCardActive: { border:'2px solid #2563EB', background:'#EFF6FF' },
  reqTop:        { display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' },
  reqAvatar:     { width:'34px', height:'34px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 },
  reqName:       { fontSize:'12px', fontWeight:'700', color:'#1E293B' },
  reqDept:       { fontSize:'10px', color:'#94A3B8' },
  reqMid:        { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' },
  reqType:       { fontSize:'11px', color:'#475569', fontWeight:'500' },
  reqDate:       { fontSize:'10px', color:'#94A3B8' },
  badge2:        { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px', flexShrink:0 },
  detailPanel:   { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflowY:'auto', maxHeight:'calc(100vh - 200px)' },
  detailHeader:  { display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', paddingBottom:'14px', borderBottom:'1px solid #F1F5F9' },
  detailName:    { fontSize:'14px', fontWeight:'700', color:'#1E293B' },
  detailDept:    { fontSize:'11px', color:'#94A3B8', marginTop:'2px' },
  detailRow:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F8FAFC' },
  detailLabel:   { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  detailValue:   { fontSize:'11px', color:'#1E293B', fontWeight:'500' },
  detailDesc:    { marginTop:'14px' },
  descText:      { fontSize:'11px', color:'#475569', lineHeight:1.7, marginTop:'6px', background:'#F8FAFC', padding:'12px', borderRadius:'8px' },
  actionNote:    { marginTop:'16px' },
  noteBox:       { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#92400E', lineHeight:1.6, marginBottom:'12px' },
  approveBtn:    { flex:1, background:'#166534', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  rejectBtn:     { flex:1, background:'#991B1B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  noSelection:   { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94A3B8' },
  emptyMsg:      { padding:'20px', textAlign:'center', fontSize:'12px', color:'#94A3B8' },
};

export default Requests;