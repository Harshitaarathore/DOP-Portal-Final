import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function VisitorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '+91 ', organization: '',
    purpose: '', other_purpose: '', visit_date: '', visit_time: '', additional_info: '',
  }); 

  const update = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
    setErrors(prev => ({...prev, [field]: ''}));
  };

  const handlePhoneChange = (value) => {
    // Always keep +91 prefix
    if (!value.startsWith('+91 ')) {
      update('phone', '+91 ');
      return;
    }
    const digits = value.replace('+91 ', '').replace(/\D/g, '');
    if (digits.length <= 10) {
      update('phone', '+91 ' + digits);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    const digits = form.phone.replace('+91 ', '');
    if (digits.length !== 10) newErrors.phone = 'Enter a valid 10-digit phone number';
    else if (!/^[6-9]/.test(digits)) newErrors.phone = 'Enter a valid Indian mobile number starting with 6-9';
    if (!form.organization.trim()) newErrors.organization = 'Organization is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext1 = () => { if (validateStep1()) setStep(2); };

  const isStep2Valid = form.purpose && form.visit_date && form.visit_time && 
  (form.purpose !== 'Other' || form.other_purpose.trim() !== '');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/visitors/request', form);
      if (res.data.success) setSubmitted(true);
      else setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={lnmiitLogo} alt="LNMIIT" style={styles.headerLogo} />
          <div>
            <div style={styles.headerTitle}>Director Office Portal</div>
            <div style={styles.headerSub}>Director's Office Visitor Registration — LNMIIT</div>
          </div>
        </div>
        <button style={styles.loginBtn} onClick={() => navigate('/')}>
          Already registered? Login →
        </button>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {submitted ? (
          <div style={styles.successCard}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successTitle}>Request Submitted Successfully!</div>
            <div style={styles.successDesc}>
              Your visit request has been sent to the Director's Office.
              Our team will review your request and send a confirmation to <strong>{form.email}</strong> within 1-2 working days.
            </div>
            <div style={styles.successDetails}>
              {[
                {label:'Name', value: form.name},
                {label:'Organization', value: form.organization},
                {label:'Purpose', value: form.purpose},
                {label:'Requested Date', value: form.visit_date},
                {label:'Requested Time', value: form.visit_time},
              ].map((r,i) => (
                <div key={i} style={styles.detailRow}>
                  <span style={styles.detailLabel}>{r.label}</span>
                  <span style={styles.detailValue}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={styles.infoBox}>
              ℹ️ Once approved, you will receive a Visitor Pass via email. Please show it at the security gate on your visit day.
            </div>
            <button style={styles.newBtn} onClick={() => { setSubmitted(false); setStep(1); setForm({ name:'', email:'', phone:'+91 ', organization:'', purpose:'', visit_date:'', visit_time:'', additional_info:'' }); }}>
              Submit Another Request
            </button>
          </div>

        ) : (
          <div style={styles.formCard}>

            {/* PROGRESS STEPS */}
            <div style={styles.stepsRow}>
              {[{num:1, label:'Personal Info'},{num:2, label:'Visit Details'},{num:3, label:'Review'}].map((s, i) => (
                <React.Fragment key={s.num}>
                  <div style={styles.stepItem}>
                    <div style={{...styles.stepCircle, background: step >= s.num ? '#1A3A6B' : '#E2E8F0', color: step >= s.num ? '#fff' : '#94A3B8'}}>
                      {step > s.num ? '✓' : s.num}
                    </div>
                    <div style={{...styles.stepLbl, color: step >= s.num ? '#1A3A6B' : '#94A3B8'}}>{s.label}</div>
                  </div>
                  {i < 2 && <div style={{...styles.stepLine, background: step > s.num ? '#1A3A6B' : '#E2E8F0'}}></div>}
                </React.Fragment>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <div style={styles.stepTitle}>👤 Personal Information</div>
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Full Name *</label>
                    <input style={{...styles.input, borderColor: errors.name ? '#EF4444' : '#E2E8F0'}}
                      placeholder="Enter your full name"
                      value={form.name} onChange={e => update('name', e.target.value)} />
                    {errors.name && <div style={styles.fieldError}>{errors.name}</div>}
                  </div>
                  <div>
                    <label style={styles.label}>Email Address *</label>
                    <input style={{...styles.input, borderColor: errors.email ? '#EF4444' : '#E2E8F0'}}
                      type="email" placeholder="Enter your email address"
                      value={form.email} onChange={e => update('email', e.target.value)} />
                    {errors.email && <div style={styles.fieldError}>{errors.email}</div>}
                  </div>
                  <div>
                    <label style={styles.label}>Phone Number *</label>
                    <input style={{...styles.input, borderColor: errors.phone ? '#EF4444' : '#E2E8F0'}}
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={e => handlePhoneChange(e.target.value)} />
                    {errors.phone && <div style={styles.fieldError}>{errors.phone}</div>}
                  </div>
                  <div>
                    <label style={styles.label}>Organization / Institution *</label>
                    <input style={{...styles.input, borderColor: errors.organization ? '#EF4444' : '#E2E8F0'}}
                      placeholder="Your organization or institution name"
                      value={form.organization} onChange={e => update('organization', e.target.value)} />
                    {errors.organization && <div style={styles.fieldError}>{errors.organization}</div>}
                  </div>
                </div>
                <button style={styles.nextBtn} onClick={handleNext1}>
                  Next → Visit Details
                </button>
              </div>
            )}

{/* STEP 2 */}
            {step === 2 && (
              <div>
                <div style={styles.stepTitle}>📅 Visit Details</div>

                {/* Purpose */}
                <div style={{marginBottom:'16px'}}>
                  <label style={styles.label}>Purpose of Visit *</label>
                  <select style={styles.select} value={form.purpose} onChange={e => update('purpose', e.target.value)}>
                    <option value="">Select purpose</option>
                    {['Academic Meeting','Industry Visit','Official Visit','Research Collaboration','Campus Recruitment','Guest Lecture','Other'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Other purpose textarea — full width */}
                {form.purpose === 'Other' && (
                  <div style={{marginBottom:'16px'}}>
                    <label style={styles.label}>Please describe your purpose *</label>
                    <textarea style={styles.textarea}
                      placeholder="Describe your purpose of visit in detail..."
                      value={form.other_purpose}
                      onChange={e => update('other_purpose', e.target.value)}
                      rows={3}
                    />
                    {errors.other_purpose && <div style={styles.fieldError}>{errors.other_purpose}</div>}
                  </div>
                )}

                {/* Date and Time */}
                <div style={styles.formGrid}>
                  <div>
                    <label style={styles.label}>Preferred Visit Date *</label>
                    <input style={styles.input} type="date"
                      value={form.visit_date} onChange={e => update('visit_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label style={styles.label}>Preferred Visit Time *</label>
                    <select style={styles.select} value={form.visit_time} onChange={e => update('visit_time', e.target.value)}>
                      <option value="">Select time slot</option>
                      {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Info */}
                <div style={{marginBottom:'16px'}}>
                  <label style={styles.label}>Additional Information (Optional)</label>
                  <textarea style={styles.textarea}
                    placeholder="Any additional details about your visit..."
                    value={form.additional_info}
                    onChange={e => update('additional_info', e.target.value)}
                    rows={3} />
                </div>

                <div style={styles.btnRow}>
                  <button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
                  <button style={{...styles.nextBtn, flex:1, opacity: isStep2Valid ? 1 : 0.5}}
                    onClick={() => isStep2Valid && setStep(3)} disabled={!isStep2Valid}>
                    Next → Review
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <div style={styles.stepTitle}>📋 Review Your Request</div>
                <div style={styles.reviewCard}>
                  <div style={styles.reviewSection}>
                    <div style={styles.reviewSectionTitle}>Personal Information</div>
                    {[
                      {label:'Full Name', value: form.name},
                      {label:'Email', value: form.email},
                      {label:'Phone', value: form.phone},
                      {label:'Organization', value: form.organization},
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
                      {label:'Purpose', value: form.purpose},
                      {label:'Visit Date', value: form.visit_date},
                      {label:'Visit Time', value: form.visit_time},
                      {label:'Additional', value: form.additional_info || 'None'},
                    ].map((r,i) => (
                      <div key={i} style={styles.reviewRow}>
                        <span style={styles.reviewLabel}>{r.label}</span>
                        <span style={styles.reviewValue}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={styles.infoBox}>
                  ℹ️ By submitting, you agree your information will be shared with the Director's Office at LNMIIT for visit approval.
                </div>
                <div style={styles.btnRow}>
                  <button style={styles.backBtn} onClick={() => setStep(2)}>← Edit Details</button>
                  <button style={{...styles.nextBtn, flex:1}} onClick={handleSubmit} disabled={submitting}>
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
  headerLogo:         { width:'80px', objectFit:'contain', background:'#fff', borderRadius:'6px', padding:'4px' },
  headerTitle:        { color:'#fff', fontSize:'14px', fontWeight:'700' },
  headerSub:          { color:'rgba(255,255,255,0.6)', fontSize:'10px' },
  loginBtn:           { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'8px', padding:'7px 16px', color:'#fff', fontSize:'11px', fontWeight:'600', cursor:'pointer' },
  content:            { maxWidth:'680px', margin:'32px auto', padding:'0 20px' },
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
  stepLbl:            { fontSize:'10px', fontWeight:'600', whiteSpace:'nowrap' },
  stepLine:           { flex:1, height:'2px', margin:'0 8px', marginBottom:'20px', transition:'background 0.2s' },
  stepTitle:          { fontSize:'15px', fontWeight:'700', color:'#1E293B', marginBottom:'18px', paddingBottom:'12px', borderBottom:'1px solid #F1F5F9' },
  formGrid:           { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'16px' },
  label:              { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:              { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  select:             { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  textarea:           { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box', resize:'vertical', fontFamily:"'DM Sans',sans-serif" },
  fieldError:         { fontSize:'10px', color:'#EF4444', marginTop:'4px' },
  btnRow:             { display:'flex', gap:'10px' },
  backBtn:            { background:'#fff', color:'#64748B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'11px 20px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  nextBtn:            { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'11px', fontSize:'12px', fontWeight:'700', cursor:'pointer' },
  reviewCard:         { background:'#F8FAFC', borderRadius:'10px', border:'1px solid #E2E8F0', padding:'16px', marginBottom:'16px' },
  reviewSection:      { marginBottom:'14px' },
  reviewSectionTitle: { fontSize:'11px', fontWeight:'700', color:'#1A3A6B', marginBottom:'10px', paddingBottom:'6px', borderBottom:'1px solid #E2E8F0' },
  reviewRow:          { display:'flex', justifyContent:'space-between', padding:'5px 0' },
  reviewLabel:        { fontSize:'11px', color:'#64748B', fontWeight:'600' },
  reviewValue:        { fontSize:'11px', color:'#1E293B', fontWeight:'500', textAlign:'right', maxWidth:'60%' },
};

export default VisitorRegister;