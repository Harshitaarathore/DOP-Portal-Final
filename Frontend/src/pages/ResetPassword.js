import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'yourname@lnmiit.ac.in';

  const getStrength = () => {
    if (password.length === 0) return { label:'', color:'#E2E8F0', width:'0%' };
    if (password.length < 6)   return { label:'Weak',   color:'#EF4444', width:'33%' };
    if (password.length < 10)  return { label:'Medium', color:'#F59E0B', width:'66%' };
    return                            { label:'Strong',  color:'#10B981', width:'100%' };
  };

  const strength = getStrength();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) { alert('Passwords do not match!'); return; }
    navigate('/success');
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
            <div style={{...styles.step, background:'rgba(255,255,255,0.5)'}}></div>
            <div style={{...styles.step, background:'#fff'}}></div>
          </div>
          <div style={styles.stepLabel}>Step 3 of 3 — Reset Password</div>
          <div style={styles.heading}>Set New Password</div>
          <div style={styles.subheading}>Choose a strong password for your account</div>
        </div>

        {/* FORM */}
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

          {/* STRENGTH BAR */}
          <div style={styles.strengthWrap}>
            <div style={styles.strengthBar}>
              <div style={{...styles.strengthFill, width: strength.width, background: strength.color}}></div>
            </div>
            {strength.label && <span style={{fontSize:'10px', color: strength.color, fontWeight:'600'}}>{strength.label}</span>}
          </div>

          <label style={styles.label}>Confirm Password</label>
          <input
            style={{...styles.input, marginBottom:'14px'}}
            type="password"
            placeholder="Re-enter new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          {/* RULES */}
          <div style={styles.rulesBox}>
            {[
              { text: 'At least 8 characters',       ok: password.length >= 8 },
              { text: 'Contains uppercase letter',    ok: /[A-Z]/.test(password) },
              { text: 'Contains a number',            ok: /[0-9]/.test(password) },
              { text: 'Contains special character',   ok: /[^A-Za-z0-9]/.test(password) },
            ].map((r,i) => (
              <div key={i} style={{fontSize:'10px', color: r.ok ? '#10B981' : '#94A3B8', marginBottom:'3px'}}>
                {r.ok ? '✓' : '•'} {r.text}
              </div>
            ))}
          </div>

          <button style={styles.btn} type="submit">Reset Password →</button>
        </form>

      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  card:         { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:          { background:'#1A3A6B', padding:'28px 32px 20px' },
  logoRow:      { display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px' },
  badge:        { width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'12px' },
  logoText:     { marginLeft:'4px' },
  logoTitle:    { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:      { color:'#BFDBFE', fontSize:'9px' },
  stepsRow:     { display:'flex', gap:'6px', marginBottom:'6px' },
  step:         { flex:1, height:'4px', borderRadius:'2px' },
  stepLabel:    { color:'#BFDBFE', fontSize:'9px', marginBottom:'10px' },
  heading:      { color:'#fff', fontSize:'18px', fontWeight:'700', marginBottom:'4px' },
  subheading:   { color:'#BFDBFE', fontSize:'11px' },
  form:         { padding:'28px 32px' },
  label:        { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  pwWrap:       { position:'relative', marginBottom:'8px' },
  input:        { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  showBtn:      { position:'absolute', right:'12px', top:'10px', fontSize:'10px', color:'#2563EB', cursor:'pointer', fontWeight:'600' },
  strengthWrap: { display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' },
  strengthBar:  { flex:1, height:'4px', background:'#E2E8F0', borderRadius:'2px' },
  strengthFill: { height:'100%', borderRadius:'2px', transition:'all 0.3s' },
  rulesBox:     { background:'#F8FAFC', borderRadius:'8px', padding:'10px 13px', marginBottom:'16px' },
  btn:          { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer' },
};

export default ResetPassword;