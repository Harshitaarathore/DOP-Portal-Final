import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import campusBg from '../assets/campus_lnmiit.jpg';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
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
    if (password !== confirm)          { setError('Passwords do not match!'); return; }
    if (password.length < 8)           { setError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(password))       { setError('Password must contain at least one uppercase letter.'); return; }
    if (!/[0-9]/.test(password))       { setError('Password must contain at least one number.'); return; }
    if (!/[^A-Za-z0-9]/.test(password)){ setError('Password must contain at least one special character.'); return; }

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

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.navLogo} />
        <span style={styles.navLink} onClick={() => navigate('/visitor-register')}>
          External visitor? Request an appointment here →
        </span>
      </div>

      {/* CARD */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <div style={styles.portalTitle}>Director's Office Portal</div>
            <div style={styles.portalSub}>The LNM Institute of Information Technology</div>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            <p style={styles.welcomeText}>Set a new password for your account</p>

            {/* New Password */}
            <label style={styles.label}>New Password</label>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <span style={styles.inputIcon} onClick={() => setShowPass(!showPass)}>
                {showPass ? 'Hide' : 'Show'}
              </span>
            </div>

            {/* Strength bar */}
            <div style={styles.strengthWrap}>
              <div style={styles.strengthBar}>
                <div style={{...styles.strengthFill, width: strength.width, background: strength.color}} />
              </div>
              {strength.label && <span style={{fontSize:'10px', color: strength.color, fontWeight:'600'}}>{strength.label}</span>}
            </div>

            {/* Confirm Password */}
            <label style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <span style={styles.inputIcon} onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? 'Hide' : 'Show'}
              </span>
            </div>

            {/* Rules */}
            <div style={styles.rulesBox}>
              {[
                { text:'At least 8 characters',     ok: password.length >= 8 },
                { text:'Contains uppercase letter',  ok: /[A-Z]/.test(password) },
                { text:'Contains a number',          ok: /[0-9]/.test(password) },
                { text:'Contains special character', ok: /[^A-Za-z0-9]/.test(password) },
              ].map((r,i) => (
                <div key={i} style={{fontSize:'10px', color: r.ok ? '#10B981' : '#94A3B8', marginBottom:'3px'}}>
                  {r.ok ? '✓' : '•'} {r.text}
                </div>
              ))}
            </div>

            {error && <div key={error + Date.now()} style={styles.errorBox}>❌ {error}</div>}

            <button style={{...styles.btnPrimary, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', fontFamily:"'DM Sans', sans-serif", display:'flex', flexDirection:'column', position:'relative', backgroundImage:`url(${campusBg})`, backgroundSize:'cover', backgroundPosition:'center' },
  navbar:       { position:'fixed', top:0, left:0, right:0, height:'60px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', zIndex:10 },
  navLogo:      { height:'40px', objectFit:'contain' },
  navLink:      { fontSize:'13px', color:'#2563EB', cursor:'pointer', fontWeight:'600' },
  cardWrapper:  { flex:1, display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'60px', position:'relative', zIndex:1 },
  card:         { background:'#fff', borderRadius:'4px', boxShadow:'0 4px 24px rgba(0,0,0,0.12)', width:'400px', overflow:'hidden' },
  cardHeader:   { background:'#fff',padding:'24px 32px 8px', textAlign:'center', borderBottom:'1px solid #f0f0f0' },
  portalTitle:  { fontSize:'20px', fontWeight:'700', color:'#1A3A6B', marginBottom:'4px' },
  portalSub:    { fontSize:'12px', color:'#64748b', marginBottom:'8px' },
  form:         { padding:'24px 32px' },
  welcomeText:  { fontSize:'13px', color:'#444', textAlign:'center', marginBottom:'16px', marginTop:0 },
  label:        { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  inputWrap:    { position:'relative', marginBottom:'8px' },
  input:        { width:'100%', border:'1px solid #ccc', borderRadius:'4px', padding:'10px 50px 10px 12px', fontSize:'13px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  inputIcon:    { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'11px', color:'#2563EB', cursor:'pointer', fontWeight:'700' },
  strengthWrap: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' },
  strengthBar:  { flex:1, height:'4px', background:'#E2E8F0', borderRadius:'2px' },
  strengthFill: { height:'100%', borderRadius:'2px', transition:'all 0.3s' },
  rulesBox:     { background:'#F8FAFC', borderRadius:'4px', padding:'10px 12px', marginBottom:'14px' },
  errorBox:     { background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:'4px', padding:'8px 12px', fontSize:'11px', color:'#991B1B', marginBottom:'12px', animation:'shake 0.4s ease' },
  btnPrimary:   { width:'100%', background:'#28a745', color:'#fff', border:'none', borderRadius:'4px', padding:'11px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
};

export default ResetPassword;