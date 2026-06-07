import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const goHome = () => {
    if (role === 'Director')       navigate('/director-dashboard');
    else if (role === 'Secretary') navigate('/dashboard');
    else if (role === 'Faculty')   navigate('/faculty-dashboard');
    else if (role === 'Visitor')   navigate('/visitor-dashboard');
    else navigate('/');
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
        </div>
        <div style={styles.body}>
          <div style={styles.code}>404</div>
          <div style={styles.title}>Page Not Found</div>
          <div style={styles.desc}>
            The page you are looking for does not exist or you don't have permission to access it.
          </div>
          <button style={styles.btn} onClick={goHome}>
            ← Go to Dashboard
          </button>
          <button style={styles.loginBtn} onClick={() => navigate('/')}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight:'100vh', background:'#F0F4FA', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif" },
  card:      { background:'#fff', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.10)', width:'420px', overflow:'hidden' },
  top:       { background:'#1A3A6B', padding:'20px 28px' },
  logoRow:   { display:'flex', alignItems:'center', gap:'8px' },
  badge:     { width:'28px', height:'28px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'12px' },
  logoText:  { marginLeft:'4px' },
  logoTitle: { color:'#fff', fontSize:'13px', fontWeight:'700' },
  logoSub:   { color:'#BFDBFE', fontSize:'9px' },
  body:      { padding:'40px 32px', textAlign:'center' },
  code:      { fontSize:'72px', fontWeight:'700', color:'#1A3A6B', lineHeight:1, marginBottom:'12px' },
  title:     { fontSize:'18px', fontWeight:'700', color:'#1E293B', marginBottom:'10px' },
  desc:      { fontSize:'12px', color:'#64748B', lineHeight:1.6, marginBottom:'24px' },
  btn:       { width:'100%', background:'#1A3A6B', color:'#fff', border:'none', borderRadius:'8px', padding:'12px', fontSize:'13px', fontWeight:'700', cursor:'pointer', marginBottom:'10px' },
  loginBtn:  { width:'100%', background:'#fff', color:'#1A3A6B', border:'1px solid #E2E8F0', borderRadius:'8px', padding:'10px', fontSize:'12px', fontWeight:'600', cursor:'pointer' },
};

export default NotFound;