import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function OTPVerification() {
  const [otp, setOtp] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (value, index) => {
  if (!/^\d*$/.test(value)) return;
  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);
  if (value && index < 5) {
    document.getElementById(`otp-${index+1}`).focus();
  }
};

const handleKeyDown = (e, index) => {
  if (e.key === 'Backspace') {
    if (otp[index] === '') {
      if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        document.getElementById(`otp-${index-1}`).focus();
      }
    } else {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email, otp: otpCode });
      if (res.data.success) {
        navigate('/reset-password', { state: { email } });
      } else {
        setError(res.data.message || 'Invalid OTP. Please try again.');
        setOtp(['','','','','','']);
        document.getElementById('otp-0').focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.top}>
          <div style={styles.logoRow}>
            <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.lnmiitLogo} />
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>Director Office Portal</div>
              <div style={styles.logoSub}>Director's Office — LNMIIT</div>
            </div>
          </div>
          <div style={styles.welcomeText}>Enter OTP</div>
          <div style={styles.welcomeSub}>6-digit code sent to your email</div>
        </div>
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
                onKeyDown={(e) => handleKeyDown(e, i)}
              />
            ))}
          </div>
          {error && <div style={styles.errorBox}>❌ {error}</div>}
          <div style={styles.timer}>OTP valid for <strong style={{color:'#1A3A6B'}}>10 minutes</strong></div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP →'}
          </button>
          <button style={styles.backBtn} type="button" onClick={() => navigate('/forgot-password')}>
            ← Back
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:        { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif" },
  card:        { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:         { background:'#1A3A6B', padding:'28px 32px 20px' },
  logoRow:     { display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' },
  logoText:    { marginLeft:'4px' },
  logoTitle:   { color:'#fff', fontSize:'14px', fontWeight:'700' },
  logoSub:     { color:'#BFDBFE', fontSize:'9px' },
  welcomeText: { color:'#fff', fontSize:'20px', fontWeight:'700', marginBottom:'4px' },
  welcomeSub:  { color:'#BFDBFE', fontSize:'11px' },
  form:        { padding:'28px 32px' },
  emailSent:   { background:'#F0F4FA', borderRadius:'8px', padding:'10px 13px', fontSize:'11px', color:'#475569', marginBottom:'18px' },
  otpRow: { display:'flex', gap:'8px', marginBottom:'10px', justifyContent:'center' },
  otpBox: { width:'42px', height:'48px', textAlign:'center', fontSize:'18px', fontWeight:'700', border:'1.5px solid #E2E8F0', borderRadius:'8px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  errorBox:    { background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', color:'#991B1B', marginBottom:'12px' },
  timer:       { fontSize:'10px', color:'#64748B', marginBottom:'16px' },
  btn:         { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', marginBottom:'10px' },
  backBtn:     { width:'100%', background:'#fff', color:'#1A3A6B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
  lnmiitLogo:  { width:'90px', objectFit:'contain', marginBottom:'8px', background:'#fff', borderRadius:'6px', padding:'4px' },
};

export default OTPVerification;