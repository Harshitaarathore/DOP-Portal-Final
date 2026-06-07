import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VisitorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('request');
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    organization: '', purpose: '', date: '', time: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const myAppointments = [
    { id:1, purpose:'Industry Visit',   date:'25 May 2026', time:'04:30 PM', status:'Approved',  pass:'VIS-2026-001' },
    { id:2, purpose:'Academic Meeting', date:'28 May 2026', time:'11:00 AM', status:'Pending',   pass:null },
  ];

  const stBg    = { Approved:'#DCFCE7', Pending:'#FEF3C7', Rejected:'#FEE2E2' };
  const stColor = { Approved:'#166534', Pending:'#92400E', Rejected:'#991B1B' };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={styles.page}>

      {/* TOP HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoRow}>
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
          </div>
          <div>
            <div style={styles.headerTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.headerSub}>Director's Office Visitor Portal</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.rolePill}>👤 Visitor</div>
          <button style={styles.logoutBtn} onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        <div style={styles.pageHeader}>
          <div style={styles.pageTitle}>👥 Visitor Portal</div>
          <div style={styles.pageSub}>Request appointments and track your visits</div>
        </div>

        {/* TABS */}
        <div style={styles.tabs}>
          {[
            {key:'request',      label:'📋 Request Appointment'},
            {key:'appointments', label:'📅 My Appointments'},
          ].map(tab => (
            <div key={tab.key}
              style={{...styles.tab, ...(activeTab===tab.key ? styles.tabActive : {})}}
              onClick={() => { setActiveTab(tab.key); setSubmitted(false); }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* REQUEST FORM TAB */}
        {activeTab === 'request' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>📋 Request an Appointment</span>
            </div>
            <div style={styles.cardBody}>

              {submitted ? (
                <div style={styles.successBox}>
                  <div style={{fontSize:'40px', marginBottom:'12px'}}>✅</div>
                  <div style={styles.successTitle}>Request Submitted Successfully!</div>
                  <div style={styles.successDesc}>
                    Your appointment request has been sent to the Director's Office.
                    You will receive a confirmation email at <strong>{form.email}</strong>.
                  </div>
                  <div style={styles.successNote}>
                    ℹ️ Approval may take 1-2 working days. Check "My Appointments" for status updates.
                  </div>
                  <button style={styles.newRequestBtn} onClick={() => { setSubmitted(false); setForm({name:'',email:'',phone:'',organization:'',purpose:'',date:'',time:''}); }}>
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div style={styles.formGrid}>
                    <div>
                      <label style={styles.label}>Full Name *</label>
                      <input style={styles.input} placeholder="Your full name"
                        value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
                    </div>
                    <div>
                      <label style={styles.label}>Email Address *</label>
                      <input style={styles.input} type="email" placeholder="your@email.com"
                        value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
                    </div>
                    <div>
                      <label style={styles.label}>Phone Number *</label>
                      <input style={styles.input} placeholder="+91 XXXXX XXXXX"
                        value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} required />
                    </div>
                    <div>
                      <label style={styles.label}>Organization *</label>
                      <input style={styles.input} placeholder="Your organization/institution"
                        value={form.organization} onChange={e => setForm({...form, organization:e.target.value})} required />
                    </div>
                    <div>
                      <label style={styles.label}>Preferred Date *</label>
                      <input style={styles.input} type="date"
                        value={form.date} onChange={e => setForm({...form, date:e.target.value})} required />
                    </div>
                    <div>
                      <label style={styles.label}>Preferred Time *</label>
                      <input style={styles.input} type="time"
                        value={form.time} onChange={e => setForm({...form, time:e.target.value})} required />
                    </div>
                  </div>

                  <div style={{marginBottom:'16px'}}>
                    <label style={styles.label}>Purpose of Visit *</label>
                    <select style={styles.select}
                      value={form.purpose} onChange={e => setForm({...form, purpose:e.target.value})} required>
                      <option value="">Select purpose</option>
                      {['Academic Meeting','Industry Visit','Official Visit','Research Collaboration','Campus Recruitment','Other'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.infoBox}>
                    ℹ️ Your request will be reviewed by the Director's Office.
                    Approval notification will be sent to your email within 1-2 working days.
                  </div>

                  <button style={styles.submitBtn} type="submit">
                    Submit Appointment Request →
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MY APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>📅 My Appointments</span>
            </div>
            <div style={styles.cardBody}>
              {myAppointments.length === 0 ? (
                <div style={styles.noData}>No appointments found</div>
              ) : (
                myAppointments.map((apt,i) => (
                  <div key={i} style={styles.aptCard}>
                    <div style={styles.aptTop}>
                      <div>
                        <div style={styles.aptPurpose}>{apt.purpose}</div>
                        <div style={styles.aptDate}>📅 {apt.date} &nbsp;|&nbsp; 🕐 {apt.time}</div>
                      </div>
                      <span style={{...styles.stBadge, background:stBg[apt.status], color:stColor[apt.status]}}>{apt.status}</span>
                    </div>
                    {apt.pass && (
                      <div style={styles.passBox}>
                        🎫 Visitor Pass: <strong style={{color:'#1A3A6B'}}>{apt.pass}</strong>
                        &nbsp;— Show this at the gate
                      </div>
                    )}
                    {apt.status === 'Pending' && (
                      <div style={styles.pendingNote}>
                        ⏳ Your request is under review. You will receive an email once approved.
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page:           { minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA' },
  header:         { background:'#1A3A6B', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  headerLeft:     { display:'flex', alignItems:'center', gap:'12px' },
  logoRow:        { display:'flex', gap:'6px' },
  badge:          { width:'26px', height:'26px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'11px' },
  headerTitle:    { color:'#fff', fontSize:'14px', fontWeight:'700' },
  headerSub:      { color:'rgba(255,255,255,0.5)', fontSize:'10px' },
  headerRight:    { display:'flex', alignItems:'center', gap:'10px' },
  rolePill:       { background:'rgba(37,99,235,0.3)', border:'1px solid rgba(37,99,235,0.5)', borderRadius:'20px', padding:'5px 12px', fontSize:'11px', color:'#fff', fontWeight:'600' },
  logoutBtn:      { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'6px 14px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer' },
  content:        { maxWidth:'800px', margin:'0 auto', padding:'24px 20px' },
  pageHeader:     { marginBottom:'16px' },
  pageTitle:      { fontSize:'20px', fontWeight:'700', color:'#1E293B' },
  pageSub:        { fontSize:'12px', color:'#64748B', marginTop:'3px' },
  tabs:           { display:'flex', gap:'4px', marginBottom:'16px', background:'#fff', padding:'4px', borderRadius:'10px', border:'1px solid #E2E8F0', width:'fit-content' },
  tab:            { padding:'8px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:'600', color:'#64748B', cursor:'pointer' },
  tabActive:      { background:'#1A3A6B', color:'#fff' },
  card:           { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' },
  cardHeader:     { padding:'14px 20px', borderBottom:'1px solid #F1F5F9' },
  cardTitle:      { fontSize:'13px', fontWeight:'700', color:'#1E293B' },
  cardBody:       { padding:'20px' },
  formGrid:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' },
  label:          { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:          { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  select:         { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  infoBox:        { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 14px', fontSize:'10px', color:'#1E40AF', marginBottom:'16px', lineHeight:1.5 },
  submitBtn:      { background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px 24px', fontSize:'13px', fontWeight:'700', cursor:'pointer' },
  successBox:     { textAlign:'center', padding:'20px 0' },
  successTitle:   { fontSize:'16px', fontWeight:'700', color:'#1E293B', marginBottom:'8px' },
  successDesc:    { fontSize:'12px', color:'#475569', lineHeight:1.6, marginBottom:'12px' },
  successNote:    { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 14px', fontSize:'10px', color:'#1E40AF', marginBottom:'16px', lineHeight:1.5, textAlign:'left' },
  newRequestBtn:  { background:'#EFF6FF', color:'#1A3A6B', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 20px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  aptCard:        { background:'#F8FAFC', borderRadius:'10px', padding:'14px', marginBottom:'10px', border:'1px solid #E2E8F0' },
  aptTop:         { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' },
  aptPurpose:     { fontSize:'13px', fontWeight:'700', color:'#1E293B' },
  aptDate:        { fontSize:'11px', color:'#64748B', marginTop:'3px' },
  stBadge:        { fontSize:'10px', fontWeight:'700', padding:'4px 10px', borderRadius:'10px' },
  passBox:        { background:'#DCFCE7', border:'1px solid #BBF7D0', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', color:'#166534', marginTop:'8px' },
  pendingNote:    { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', color:'#92400E', marginTop:'8px' },
  noData:         { textAlign:'center', padding:'30px', fontSize:'12px', color:'#94A3B8' },
};

export default VisitorPage;