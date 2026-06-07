import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OTPVerification() {
  const [otp, setOtp] = useState(['','','','','','']);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'yourname@lnmiit.ac.in';

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index+1}`).focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* TOP */}
        <div style={styles.top}>
          <div style={styles.logoRow}>
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>DOP Portal</div>
              <div style={styles.logoSub}>Director's Office — LNMIIT</div>
            </div>
          </div>
          <div style={styles.stepsRow}>
            <div style={{...styles.step, background:'rgba(255,255,255,0.5)'}}></div>
            <div style={{...styles.step, background:'#fff'}}></div>
            <div style={{...styles.step, background:'rgba(255,255,255,0.3)'}}></div>
          </div>
          <div style={styles.stepLabel}>Step 2 of 3 — OTP Verification</div>
          <div style={styles.heading}>Enter OTP</div>
          <div style={styles.subheading}>6-digit code sent to your LNMIIT email</div>
        </div>

        {/* FORM */}
        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.emailSent}>
            OTP sent to: <strong style={{color:'#1A3A6B'}}>{email}</strong>
          </div>

          <div style={styles.otpRow}>
            {otp.map((val, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                style={styles.otpBox}
                type="text"
                maxLength="1"
                value={val}
                onChange={(e) => handleChange(e.target.value, i)}
              />
            ))}
          </div>

          <div style={styles.timer}>Time remaining: <strong style={{color:'#1A3A6B'}}>09:42</strong></div>
          <div style={styles.warningBox}>⚠ Max 3 wrong attempts — account locks for 30 minutes after that.</div>

          <button style={styles.btn} type="submit">Verify OTP →</button>
          <button style={styles.backBtn} type="button" onClick={() => navigate('/forgot-password')}>
            ← Back
          </button>
        </form>

      </div>
    </div>
  );
}

const styles = {
  page:       { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  card:       { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:        { background:'#1A3A6B', padding:'28px 32px 20px' },
  logoRow:    { display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' },
  badge:      { width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'12px' },
  logoText:   { marginLeft:'4px' },
  logoTitle:  { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:    { color:'#BFDBFE', fontSize:'9px' },
  stepsRow:   { display:'flex', gap:'6px', marginBottom:'6px' },
  step:       { flex:1, height:'4px', borderRadius:'2px' },
  stepLabel:  { color:'#BFDBFE', fontSize:'9px', marginBottom:'10px' },
  heading:    { color:'#fff', fontSize:'18px', fontWeight:'700', marginBottom:'4px' },
  subheading: { color:'#BFDBFE', fontSize:'11px' },
  form:       { padding:'28px 32px' },
  emailSent:  { background:'#F0F4FA', borderRadius:'8px', padding:'10px 13px', fontSize:'11px', color:'#475569', marginBottom:'18px' },
  otpRow:     { display:'flex', gap:'10px', marginBottom:'10px' },
  otpBox:     { width:'52px', height:'52px', textAlign:'center', fontSize:'20px', fontWeight:'700', border:'1.5px solid #E2E8F0', borderRadius:'8px', color:'#1E293B', outline:'none' },
  timer:      { fontSize:'10px', color:'#64748B', marginBottom:'12px' },
  warningBox: { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'8px', padding:'8px 12px', fontSize:'10px', color:'#92400E', marginBottom:'16px' },
  btn:        { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', marginBottom:'10px' },
  backBtn:    { width:'100%', background:'#fff', color:'#1A3A6B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
};

export default OTPVerification;