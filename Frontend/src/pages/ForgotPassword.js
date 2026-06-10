import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        navigate('/otp', { state: { email } });
      } else {
        setError(res.data.message || 'Failed to send OTP. Try again.');
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
            <div style={{...styles.badge, background:'#2563EB'}}>D</div>
            <div style={{...styles.badge, background:'#0EA5E9'}}>O</div>
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>DOP Portal</div>
              <div style={styles.logoSub}>Director's Office — LNMIIT</div>
            </div>
          </div>
          <div style={styles.stepsRow}>
            <div style={{...styles.step, background:'#fff'}}></div>
            <div style={{...styles.step, background:'rgba(255,255,255,0.3)'}}></div>
            <div style={{...styles.step, background:'rgba(255,255,255,0.3)'}}></div>
          </div>
          <div style={styles.stepLabel}>Step 1 of 3 — Enter Email</div>
          <div style={styles.heading}>Forgot Password?</div>
          <div style={styles.subheading}>Enter your registered email</div>
        </div>
        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="yourname@lnmiit.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <div style={styles.errorBox}>❌ {error}</div>
          )}
          <div style={styles.infoBox}>
            ⚠ OTP will be sent to this email. Valid for 10 minutes only.
          </div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Send OTP →'}
          </button>
          <button style={styles.backBtn} type="button" onClick={() => navigate('/')}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  card:      { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:       { background:'#1A3A6B', padding:'28px 32px 20px' },
  logoRow:   { display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' },
  badge:     { width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'12px' },
  logoText:  { marginLeft:'4px' },
  logoTitle: { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:   { color:'#BFDBFE', fontSize:'9px' },
  stepsRow:  { display:'flex', gap:'6px', marginBottom:'6px' },
  step:      { flex:1, height:'4px', borderRadius:'2px' },
  stepLabel: { color:'#BFDBFE', fontSize:'9px', marginBottom:'10px' },
  heading:   { color:'#fff', fontSize:'18px', fontWeight:'700', marginBottom:'4px' },
  subheading:{ color:'#BFDBFE', fontSize:'11px' },
  form:      { padding:'28px 32px' },
  label:     { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:     { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', marginBottom:'16px', boxSizing:'border-box' },
  errorBox:  { background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:'8px', padding:'8px 12px', fontSize:'11px', color:'#991B1B', marginBottom:'12px' },
  infoBox:   { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'8px', padding:'10px 13px', fontSize:'10px', color:'#92400E', marginBottom:'18px', lineHeight:1.5 },
  btn:       { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', marginBottom:'10px' },
  backBtn:   { width:'100%', background:'#fff', color:'#1A3A6B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
};

export default ForgotPassword;