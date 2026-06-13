import API from '../api';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import lnmiitLogo from '../assets/lnmiit-logo.png';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('role', res.data.data.role);
      localStorage.setItem('name', res.data.data.name);
      localStorage.setItem('email', res.data.data.email || email);

      const role = res.data.data.role;
      if (role === 'Director')       navigate('/director-dashboard');
      else if (role === 'Secretary') navigate('/dashboard');
      else if (role === 'Staff')     navigate('/staff-portal');
      else if (role === 'Faculty')   navigate('/staff-portal');
      else if (role === 'Visitor')   navigate('/visitor-dashboard');
      else navigate('/dashboard');
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    alert('Login failed. Make sure backend is running.');
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* TOP BANNER */}
        <div style={styles.top}>
          <div style={styles.logoRow}>
            <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.lnmiitLogo} />
            <div style={styles.logoText}>
              <div style={styles.logoTitle}> Director Office Portal</div>
              <div style={styles.logoSub}>Director's Office — LNMIIT</div>
            </div>
          </div>
          <div style={styles.welcomeText}>Welcome</div>
          <div style={styles.welcomeSub}>Only Instituional email's are allowed.</div>
        </div>

        {/* FORM */}
        <form style={styles.form} onSubmit={handleLogin}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <div style={styles.pwWrap}>
            <input
              style={{...styles.input, marginBottom: 0}}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              style={styles.showBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          <div style={styles.forgotRow}>
            <span style={styles.forgotLink} onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
          </div>

          <button style={styles.btn} type="submit">Sign In →</button>


          <div style={styles.visitorLink} onClick={() => navigate('/visitor-register')}>
               External visitor? Request an appointment here →
          </div>
            <div style={styles.rights}>
              © 2026 LNMIIT · All rights reserved
            </div>
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
  badge:       { width:'30px', height:'30px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'13px' },
  logoText:    { marginLeft:'4px' },
  logoTitle:   { color:'#fff', fontSize:'14px', fontWeight:'700' },
  logoSub:     { color:'#BFDBFE', fontSize:'9px' },
  welcomeText: { color:'#fff', fontSize:'20px', fontWeight:'700', marginBottom:'4px' },
  welcomeSub:  { color:'#BFDBFE', fontSize:'11px' },
  form:        { padding:'28px 32px' },
  label:       { display:'block', fontSize:'11px', fontWeight:'600', color:'#475569', marginBottom:'6px' },
  input:       { width:'100%', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px 13px', fontSize:'12px', color:'#1E293B', outline:'none', marginBottom:'16px', boxSizing:'border-box' },
  pwWrap:      { position:'relative', marginBottom:'8px' },
  showBtn:     { position:'absolute', right:'12px', top:'10px', fontSize:'10px', color:'#2563EB', cursor:'pointer', fontWeight:'600' },
  forgotRow:   { textAlign:'right', marginBottom:'20px' },
  forgotLink:  { fontSize:'11px', color:'#2563EB', cursor:'pointer', fontWeight:'600' },
  btn:         { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', marginBottom:'14px' },
  visitorLink: { fontSize:'10px', color:'#2563EB', textAlign:'center', cursor:'pointer', marginTop:'8px', fontWeight:'600' },
  rights:        { fontSize:'9px', color:'#94A3B8', textAlign:'center', marginTop:'8px' },
  lnmiitLogo: { width: '90px', objectFit: 'contain', marginBottom: '8px', background: '#fff', borderRadius: '6px', padding: '4px' },
topbarLogo: { height: '32px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '3px' },
};

export default Login;