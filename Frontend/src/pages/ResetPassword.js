import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const getStrength = () => {
    if (password.length === 0) return { label:'', color:'#E2E8F0', width:'0%' };
    if (password.length < 6)   return { label:'Weak',   color:'#EF4444', width:'33%' };
    if (password.length < 10)  return { label:'Medium', color:'#F59E0B', width:'66%' };
    return                            { label:'Strong',  color:'#10B981', width:'100%' };
  };

  const strength = getStrength();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Check match first
  if (password !== confirm) { setError('Passwords do not match!'); return; }

  // Then check rules
  if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
  if (!/[A-Z]/.test(password)) { setError('Password must contain at least one uppercase letter.'); return; }
  if (!/[0-9]/.test(password)) { setError('Password must contain at least one number.'); return; }
  if (!/[^A-Za-z0-9]/.test(password)) { setError('Password must contain at least one special character.'); return; }

  setLoading(true);
  try {
    const res = await API.post('/auth/reset-password', { email, newPassword: password });
    if (res.data.success) {
      navigate('/success');
    } else {
      setError(res.data.message || 'Failed to reset password.');
    }
  } catch (err) {
    setError('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.page}>
      <style>{`
  @keyframes shake {
    0%   { transform: translateX(0); }
    20%  { transform: translateX(-8px); }
    40%  { transform: translateX(8px); }
    60%  { transform: translateX(-6px); }
    80%  { transform: translateX(6px); }
    100% { transform: translateX(0); }
  }
`}</style>
      <div style={styles.card}>
        <div style={styles.top}>
          <div style={styles.logoRow}>
            <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.lnmiitLogo} />
            <div style={styles.logoText}>
              <div style={styles.logoTitle}>Director Office Portal</div>
              <div style={styles.logoSub}>Director's Office — LNMIIT</div>
            </div>
          </div>
          <div style={styles.welcomeText}>Set New Password</div>
          <div style={styles.welcomeSub}>Choose a strong password for your account</div>
        </div>
        <form style={styles.form} onSubmit={handleSubmit}>
          <label style={styles.label}>New Password</label>
          <div style={styles.pwWrap}>
            <input
              style={styles.input}
              type={show ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span style={styles.showBtn} onClick={() => setShow(!show)}>
              {show ? 'Hide' : 'Show'}
            </span>
          </div>

          <div style={styles.strengthWrap}>
            <div style={styles.strengthBar}>
              <div style={{...styles.strengthFill, width: strength.width, background: strength.color}}></div>
            </div>
            {strength.label && <span style={{fontSize:'10px', color: strength.color, fontWeight:'600'}}>{strength.label}</span>}
          </div>

          <label style={styles.label}>Confirm Password</label>
<div style={styles.pwWrap}>
  <input
    style={{...styles.input, marginBottom:'14px'}}
    type={showConfirm ? 'text' : 'password'}
    placeholder="Re-enter new password"
    value={confirm}
    onChange={(e) => setConfirm(e.target.value)}
    required
  />
  <span style={styles.showBtn} onClick={() => setShowConfirm(!showConfirm)}>
    {showConfirm ? 'Hide' : 'Show'}
  </span>
</div>
           
          <div style={styles.rulesBox}>
            {[
              { text: 'At least 8 characters',     ok: password.length >= 8 },
              { text: 'Contains uppercase letter',  ok: /[A-Z]/.test(password) },
              { text: 'Contains a number',          ok: /[0-9]/.test(password) },
              { text: 'Contains special character', ok: /[^A-Za-z0-9]/.test(password) },
            ].map((r,i) => (
              <div key={i} style={{fontSize:'10px', color: r.ok ? '#10B981' : '#94A3B8', marginBottom:'3px'}}>
                {r.ok ? '✓' : '•'} {r.text}
              </div>
            ))}
          </div>

          {error && <div key={error + Date.now()} style={styles.errorBox}>❌ {error}</div>}

          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans', sans-serif" },
  card:         { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:          { background:'#1A3A6B', padding:'28px 32px 20px' },
  logoRow:      { display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' },
  logoText:     { marginLeft:'4px' },
  logoTitle:    { color:'#fff', fontSize:'14px', fontWeight:'700' },
  logoSub:      { color:'#BFDBFE', fontSize:'9px' },
  welcomeText:  { color:'#fff', fontSize:'20px', fontWeight:'700', marginBottom:'4px' },
  welcomeSub:   { color:'#BFDBFE', fontSize:'11px' },
  form:         { padding:'28px 32px' },
  label:        { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  pwWrap:       { position:'relative', marginBottom:'8px' },
  input:        { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  showBtn:      { position:'absolute', right:'12px', top:'10px', fontSize:'10px', color:'#2563EB', cursor:'pointer', fontWeight:'600' },
  strengthWrap: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' },
  strengthBar:  { flex:1, height:'4px', background:'#E2E8F0', borderRadius:'2px' },
  strengthFill: { height:'100%', borderRadius:'2px', transition:'all 0.3s' },
  rulesBox:     { background:'#F8FAFC', borderRadius:'8px', padding:'10px 13px', marginBottom:'16px' },
  errorBox: { 
  background:'#FEE2E2', 
  border:'1px solid #FCA5A5', 
  borderRadius:'8px', 
  padding:'8px 12px', 
  fontSize:'11px', 
  color:'#991B1B', 
  marginBottom:'12px',
  animation: 'shake 0.4s ease'
},
  btn:          { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer' },
  lnmiitLogo:   { width:'90px', objectFit:'contain', marginBottom:'8px', background:'#fff', borderRadius:'6px', padding:'4px' },
};

export default ResetPassword;