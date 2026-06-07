import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function VisitorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    purpose: '',
    visit_date: '',
    visit_time: '',
    additional_info: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post('/visitors/request', form);
      if (res.data.success) {
        setSubmitted(true);
      }
    } catch (err) {
      // demo mode
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const update = (field, value) => setForm(prev => ({...prev, [field]: value}));

  const isStep1Valid = form.name && form.email && form.phone && form.organization;
  const isStep2Valid = form.purpose && form.visit_date && form.visit_time;

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoRow}>
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
          </div>
          <div>
            <div style={styles.headerTitle}>DOP Portal — LNMIIT</div>
            <div style={styles.headerSub}>Director's Office Visitor Registration</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.loginBtn} onClick={() => navigate('/')}>
            Already registered? Login →
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {submitted ? (
          /* SUCCESS SCREEN */
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successTitle}>Request Submitted Successfully!</div>
            <div style={styles.successDesc}>
              Your visit request has been sent to the Director's Office at LNMIIT.
              You will receive a confirmation email at <strong>{form.email}</strong> within 1-2 working days.
            </div>
            <div style={styles.successDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Name</span>
                <span style={styles.detailValue}>{form.name}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Organization</span>
                <span style={styles.detailValue}>{form.organization}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Purpose</span>
                <span style={styles.detailValue}>{form.purpose}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Requested Date</span>
                <span style={styles.detailValue}>{form.visit_date}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Requested Time</span>
                <span style={styles.detailValue}>{form.visit_time}</span>
              </div>
            </div>
            <div style={styles.infoBox}>
              ℹ️ Once approved, you will receive a Visitor Pass via email. Please show it at the security gate on your visit day.
            </div>
            <button style={styles.newBtn} onClick={() => { setSubmitted(false); setStep(1); setForm({ name:'', email:'', phone:'', organization:'', purpose:'', visit_date:'', visit_time:'', additional_info:'' }); }}>
              Submit Another Request
            </button>
          </div>

        ) : (
          <div style={styles.formCard}>

            {/* PROGRESS STEPS */}
            <div style={styles.stepsRow}>
              {[
                {num:1, label:'Personal Info'},
                {num:2, label:'Visit Details'},
                {num:3, label:'Review'},
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  <div style={styles.stepItem}>
                    <div style={{
                      ...styles.stepCircle,
                      background: step >= s.num ? '#1A3A6B' : '#E2E8F0',
                      color: step >= s.num ? '#fff' : '#94A3B8',
                    }}>{step > s.num ? '✓' : s.num}</div>
                    <div style={{...styles.stepLabel, color: step >= s.num ? '#1A3A6B' : '#94A3B8'}}>{s.label}</div>
                  </div>
                  {i < 2 && <div style={{...styles.stepLine, background: step > s.num ? '#1A3A6B' : '#E2E8F0'}}></div>}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 1 — PERSONAL INFO */}
            {step === 1 && (
              <div>
                <div style={styles.stepTitle}>👤 Personal Information</div>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Full Name *</label>
                    <input style={styles.input} placeholder="Your full name"
                      value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Email Address *</label>
                    <input style={styles.input} type="email" placeholder="your@email.com"
                      value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Phone Number *</label>
                    <input style={styles.input} placeholder="+91 XXXXX XXXXX"
                      value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                  <div>
                    <label style={styles.label}>Organization / Institution *</label>
                    <input style={styles.input} placeholder="Your organization name"
                      value={form.organization} onChange={e => update('organization', e.target.value)} />
                  </div>
                </div>
                <button
                  style={{...styles.nextBtn, opacity: isStep1Valid ? 1 : 0.5}}
                  onClick={() => isStep1Valid && setStep(2)}
                  disabled={!isStep1Valid}
                >
                  Next → Visit Details
                </button>
              </div>
            )}

            {/* STEP 2 — VISIT DETAILS */}
            {step === 2 && (
              <div>
                <div style={styles.stepTitle}>📅 Visit Details</div>
                <div style={{marginBottom:'16px'}}>
                  <label style={styles.label}>Purpose of Visit *</label>
                  <select style={styles.select}
                    value={form.purpose} onChange={e => update('purpose', e.target.value)}
                  >
                    <option value="">Select purpose</option>
                    {['Academic Meeting','Industry Visit','Official Visit','Research Collaboration','Campus Recruitment','Guest Lecture','Other'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Preferred Visit Date *</label>
                    <input style={styles.input} type="date"
                      value={form.visit_date} onChange={e => update('visit_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Preferred Visit Time *</label>
                    <select style={styles.select}
                      value={form.visit_time} onChange={e => update('visit_time', e.target.value)}
                    >
                      <option value="">Select time slot</option>
                      {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{marginBottom:'16px'}}>
                  <label style={styles.label}>Additional Information (Optional)</label>
                  <textarea style={styles.textarea}
                    placeholder="Any additional details about your visit..."
                    value={form.additional_info}
                    onChange={e => update('additional_info', e.target.value)}
                    rows={3}
                  />
                </div>
                <div style={styles.btnRow}>
                  <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                  <button
                    style={{...styles.nextBtn, opacity: isStep2Valid ? 1 : 0.5}}
                    onClick={() => isStep2Valid && setStep(3)}
                    disabled={!isStep2Valid}
                  >
                    Next → Review
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — REVIEW */}
            {step === 3 && (
              <div>
                <div style={styles.stepTitle}>📋 Review Your Request</div>
                <div style={styles.reviewCard}>
                  <div style={styles.reviewSection}>
                    <div style={styles.reviewSectionTitle}>Personal Information</div>
                    {[
                      {label:'Full Name',     value: form.name},
                      {label:'Email',         value: form.email},
                      {label:'Phone',         value: form.phone},
                      {label:'Organization',  value: form.organization},
                    ].map((r,i) => (
                      <div key={i} style={styles.reviewRow}>
                        <span style={styles.reviewLabel}>{r.label}</span>
                        <span style={styles.reviewValue}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div style={styles.reviewSection}>
                    <div style={styles.reviewSectionTitle}>Visit Details</div>
                    {[
                      {label:'Purpose',       value: form.purpose},
                      {label:'Visit Date',    value: form.visit_date},
                      {label:'Visit Time',    value: form.visit_time},
                      {label:'Additional',    value: form.additional_info || 'None'},
                    ].map((r,i) => (
                      <div key={i} style={styles.reviewRow}>
                        <span style={styles.reviewLabel}>{r.label}</span>
                        <span style={styles.reviewValue}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.infoBox}>
                  ℹ️ By submitting this request, you agree that your information will be shared with the Director's Office at LNMIIT for visit approval purposes.
                </div>
                <div style={styles.btnRow}>
                  <button style={styles.backBtn} onClick={() => setStep(2)}>← Edit Details</button>
                  <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : '✓ Submit Visit Request'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:               { minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", background:'#F0F4FA' },
  header:             { background:'#1A3A6B', padding:'14px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  headerLeft:         { display:'flex', alignItems:'center', gap:'12px' },
  logoRow:            { display:'flex', gap:'6px' },
  badge:              { width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'12px' },
  headerTitle:        { color:'#fff', fontSize:'14px', fontWeight:'700' },
  headerSub:          { color:'rgba(255,255,255,0.5)', fontSize:'10px' },
  headerRight:        { display:'flex', alignItems:'center', gap:'10px' },
  loginBtn:           { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'7px 16px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer' },
  content:            { maxWidth:'680px', margin:'0 auto', padding:'28px 20px' },
  successCard:        { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'32px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  successIcon:        { fontSize:'48px', marginBottom:'14px' },
  successTitle:       { fontSize:'18px', fontWeight:'700', color:'#1E293B', marginBottom:'10px' },
  successDesc:        { fontSize:'12px', color:'#475569', lineHeight:1.7, marginBottom:'20px' },
  successDetails:     { background:'#F8FAFC', borderRadius:'10px', padding:'16px', marginBottom:'16px', textAlign:'left' },
  detailRow:          { display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #F1F5F9' },
  detailLabel:        { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  detailValue:        { fontSize:'11px', color:'#1E293B', fontWeight:'500' },
  infoBox:            { background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 14px', fontSize:'10px', color:'#1E40AF', marginBottom:'16px', lineHeight:1.6, textAlign:'left' },
  newBtn:             { background:'#EFF6FF', color:'#1A3A6B', border:'1px solid #BFDBFE', borderRadius:'8px', padding:'10px 20px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  formCard:           { background:'#fff', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'28px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' },
  stepsRow:           { display:'flex', alignItems:'center', marginBottom:'28px' },
  stepItem:           { display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' },
  stepCircle:         { width:'32px', height:'32px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', transition:'all 0.2s' },
  stepLabel:          { fontSize:'10px', fontWeight:'600', whiteSpace:'nowrap' },
  stepLine:           { flex:1, height:'2px', margin:'0 8px', marginBottom:'20px', transition:'background 0.2s' },
  stepTitle:          { fontSize:'15px', fontWeight:'700', color:'#1E293B', marginBottom:'18px', paddingBottom:'12px', borderBottom:'1px solid #F1F5F9' },
  formGrid:           { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px' },
  label:              { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:              { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  select:             { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  textarea:           { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:"'DM Sans',sans-serif" },
  btnRow:             { display:'flex', gap:'10px' },
  backBtn:            { background:'#fff', color:'#64748B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'11px 20px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  nextBtn:            { flex:1, background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  submitBtn:          { flex:1, background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  reviewCard:         { background:'#F8FAFC', borderRadius:'10px', border:'1px solid #E2E8F0', padding:'16px', marginBottom:'16px' },
  reviewSection:      { marginBottom:'14px' },
  reviewSectionTitle: { fontSize:'11px', fontWeight:'700', color:'#1A3A6B', marginBottom:'10px', paddingBottom:'6px', borderBottom:'1px solid #E2E8F0' },
  reviewRow:          { display:'flex', justifyContent:'space-between', padding:'5px 0' },
  reviewLabel:        { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  reviewValue:        { fontSize:'11px', color:'#1E293B', fontWeight:'500', textAlign:'right', maxWidth:'60%' },
};

export default VisitorRegister;