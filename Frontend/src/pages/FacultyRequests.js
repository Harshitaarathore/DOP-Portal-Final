import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function FacultyRequests() {
  const navigate = useNavigate();
  const [myRequests, setMyRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
  purpose: 'Meeting Request',
  priority: 'Medium',
  preferred_date: '',
  description: '',
  attachment: null,
});

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await API.get('/meetings/my');
      if (res.data.success) {
        setMyRequests(res.data.data);
      }
    } catch (err) {
      // fallback dummy data
      setMyRequests([
        { id:1, purpose:'Meeting Request',  preferred_date:'2026-05-24', priority:'High',   status:'Pending',  description:'Requesting a meeting to discuss curriculum changes.' },
        { id:2, purpose:'Leave Approval',   preferred_date:'2026-05-20', priority:'Medium', status:'Approved', description:'3 days leave for IEEE conference in Delhi.' },
        { id:3, purpose:'Research Fund',    preferred_date:'2026-05-15', priority:'Low',    status:'Rejected', description:'Research funding request for lab equipment.' },
      ]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/meetings/request', form);
      if (res.data.success) {
        setSuccessMsg('✅ Request submitted successfully! You will be notified via email.');
        setShowForm(false);
        setForm({ purpose:'Meeting Request', priority:'Medium', preferred_date:'', description:'' });
        fetchMyRequests();
      }
    } catch (err) {
      setSuccessMsg('✅ Request submitted! (Demo mode)');
      setMyRequests(prev => [{
        id: Date.now(),
        purpose: form.purpose,
        preferred_date: form.preferred_date,
        priority: form.priority,
        status: 'Pending',
        description: form.description,
      }, ...prev]);
      setShowForm(false);
      setForm({ purpose:'Meeting Request', priority:'Medium', preferred_date:'', description:'' });
    }
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const stBg    = { Pending:'#FEF3C7', Approved:'#DCFCE7', Rejected:'#FEE2E2' };
  const stColor = { Pending:'#92400E', Approved:'#166534', Rejected:'#991B1B' };
  const priBg   = { High:'#FEE2E2', Medium:'#DBEAFE', Low:'#DCFCE7' };
  const priColor= { High:'#991B1B', Medium:'#1E40AF', Low:'#166534' };

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
          {label:'Dashboard',   path:'/faculty-dashboard'},
          {label:'My Requests', path:'/faculty-requests'},
          {label:'Calendar',    path:'/faculty-calendar'},
          {label:'My Tasks',    path:'/tasks'},
          {label:'Settings',    path:'/settings'},
        ].map((item, i) => (
          <div key={i}
            style={{...styles.navItem, ...(i===1 ? styles.navActive : {})}}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
        <div style={styles.sidebarFooter}>
          <div style={styles.avatar}>FA</div>
          <div style={{flex:1}}>
            <div style={styles.userName}>Faculty</div>
            <div style={styles.userRole}>LNMIIT</div>
          </div>
          <div style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>↩</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.topbarTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.topbarSub}>Faculty View</div>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.notifBtn} onClick={() => navigate('/notifications')}>🔔</div>
            <div style={styles.rolePill}>👤 Faculty ▾</div>
          </div>
        </div>

        <div style={styles.content}>

          {/* HEADER */}
          <div style={styles.pageHeader}>
            <div>
              <div style={styles.pageTitle}>📋 My Requests</div>
              <div style={styles.pageSub}>Submit and track your requests to the Director</div>
            </div>
            <button style={styles.newBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ New Request'}
            </button>
          </div>

          {/* SUCCESS MESSAGE */}
          {successMsg && (
            <div style={styles.successMsg}>{successMsg}</div>
          )}

          {/* NEW REQUEST FORM */}
          {showForm && (
            <div style={styles.formCard}>
              <div style={styles.formTitle}>📋 Submit New Request to Director</div>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Request Type *</label>
                    <select style={styles.select}
                      value={form.purpose}
                      onChange={e => setForm({...form, purpose:e.target.value})}
                    >
                      {['Meeting Request','Leave Approval','Research Fund','Document Sign','Other'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Priority *</label>
                    <select style={styles.select}
                      value={form.priority}
                      onChange={e => setForm({...form, priority:e.target.value})}
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Preferred Date *</label>
                    <input style={styles.input} type="date"
                      value={form.preferred_date}
                      onChange={e => setForm({...form, preferred_date:e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div style={{marginBottom:'16px'}}>
                <label style={styles.label}>Attach Document (Optional)</label>
                <input
                  style={{...styles.input, padding:'8px 13px', cursor:'pointer'}}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={e => setForm({...form, attachment: e.target.files[0]})}
                />
                <div style={{fontSize:'10px', color:'#94A3B8', marginTop:'4px'}}>
                  Accepted: PDF, DOC, DOCX, JPG, PNG (max 5MB)
                </div>
              </div>
                <div style={{marginBottom:'16px'}}>
                  <label style={styles.label}>Description *</label>
                  <textarea style={styles.textarea}
                    placeholder="Describe your request in detail..."
                    value={form.description}
                    onChange={e => setForm({...form, description:e.target.value})}
                    required rows={4}
                  />
                </div>
                <div style={styles.infoBox}>
                  ℹ️ Your request will be reviewed by the Director. You will be notified via your LNMIIT email once a decision is made.
                </div>
                <button style={styles.submitBtn} type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request →'}
                </button>
              </form>
            </div>
          )}

          {/* STAT ROW */}
          <div style={styles.statRow}>
            {[
              {label:'Total',    num:myRequests.length,                                          bg:'#EFF6FF', color:'#1A3A6B'},
              {label:'Pending',  num:myRequests.filter(r=>r.status==='Pending').length,          bg:'#FEF3C7', color:'#92400E'},
              {label:'Approved', num:myRequests.filter(r=>r.status==='Approved').length,         bg:'#DCFCE7', color:'#166534'},
              {label:'Rejected', num:myRequests.filter(r=>r.status==='Rejected').length,         bg:'#FEE2E2', color:'#991B1B'},
            ].map((s,i) => (
              <div key={i} style={{...styles.statCard, background:s.bg}}>
                <div style={{...styles.statNum, color:s.color}}>{s.num}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* REQUESTS LIST */}
          <div style={styles.listWrap}>
            {loading ? (
              <div style={styles.loading}>Loading your requests...</div>
            ) : myRequests.length === 0 ? (
              <div style={styles.noData}>
                <div style={{fontSize:'32px', marginBottom:'10px'}}>📋</div>
                <div style={{fontSize:'13px', fontWeight:'600', color:'#1E293B'}}>No requests yet</div>
                <div style={{fontSize:'11px', color:'#94A3B8', marginTop:'4px'}}>Click "+ New Request" to submit your first request</div>
              </div>
            ) : (
              myRequests.map((req, i) => (
                <div key={req.id} style={styles.reqCard}>
                  <div style={styles.reqLeft}>
                    <div style={styles.reqType}>{req.purpose}</div>
                    <div style={styles.reqDate}>📅 Preferred: {req.preferred_date?.split('T')[0]}</div>
                    {req.description && (
                      <div style={styles.reqDesc}>{req.description}</div>
                    )}
                  </div>
                  <div style={styles.reqRight}>
                    <span style={{...styles.badge2, background:priBg[req.priority], color:priColor[req.priority], marginBottom:'6px'}}>{req.priority}</span>
                    <span style={{...styles.badge2, background:stBg[req.status], color:stColor[req.status]}}>{req.status}</span>
                  </div>
                </div>
              ))
            )}
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
  newBtn:        { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'9px 16px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  successMsg:    { background:'#DCFCE7', color:'#166534', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'10px 16px', fontSize:'12px', fontWeight:'600', marginBottom:'14px' },
  formCard:      { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  formTitle:     { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'16px', paddingBottom:'10px', borderBottom:'1px solid #F1F5F9' },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'14px' },
  label:         { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  select:        { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  input:         { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  textarea:      { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:"'DM Sans',sans-serif" },
  infoBox:       { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#1E40AF', marginBottom:'16px', lineHeight:1.5 },
  submitBtn:     { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px 24px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  statRow:       { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' },
  statCard:      { borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' },
  statNum:       { fontSize:'22px', fontWeight:'700', lineHeight:1 },
  statLabel:     { fontSize:'10px', color:'#64748B', fontWeight:'500' },
  listWrap:      { display:'flex', flexDirection:'column', gap:'8px' },
  loading:       { textAlign:'center', padding:'30px', fontSize:'12px', color:'#94A3B8' },
  noData:        { textAlign:'center', padding:'40px', color:'#94A3B8' },
  reqCard:       { background:'#fff', borderRadius:'10px', padding:'14px 16px', border:'1px solid #E2E8F0', display:'flex', alignItems:'flex-start', justifyContent:'space-between', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' },
  reqLeft:       { flex:1 },
  reqType:       { fontSize:'13px', fontWeight:'700', color:'#1E293B', marginBottom:'4px' },
  reqDate:       { fontSize:'10px', color:'#94A3B8', marginBottom:'6px' },
  reqDesc:       { fontSize:'11px', color:'#475569', lineHeight:1.5 },
  reqRight:      { display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px', flexShrink:0, marginLeft:'12px' },
  badge2:        { fontSize:'9px', fontWeight:'700', padding:'3px 9px', borderRadius:'10px' },
};

export default FacultyRequests;