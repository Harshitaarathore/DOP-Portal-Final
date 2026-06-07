import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
        </div>
        <div style={styles.body}>
          <div style={styles.iconCircle}>✅</div>
          <div style={styles.heading}>Password Reset Successful!</div>
          <p style={styles.subtext}>Your password has been updated successfully. You can now log in with your new password.</p>
          <div style={styles.redirectNote}>Redirecting to login in <strong style={{color:'#1A3A6B'}}>3 seconds...</strong></div>
          <button style={styles.btn} onClick={() => navigate('/')}>Go to Login →</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  card:         { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:          { background:'#1A3A6B', padding:'20px 32px' },
  logoRow:      { display:'flex', alignItems:'center', gap:'8px' },
  badge:        { width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'12px' },
  logoText:     { marginLeft:'4px' },
  logoTitle:    { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:      { color:'#BFDBFE', fontSize:'9px' },
  body:         { padding:'36px 32px', textAlign:'center' },
  iconCircle:   { fontSize:'48px', marginBottom:'16px' },
  heading:      { fontSize:'18px', fontWeight:'700', color:'#1E293B', marginBottom:'8px' },
  subtext:      { fontSize:'11px', color:'#64748B', lineHeight:1.6, marginBottom:'20px' },
  redirectNote: { fontSize:'11px', color:'#94A3B8', marginBottom:'20px' },
  btn:          { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer' },
};

export default SuccessPage;