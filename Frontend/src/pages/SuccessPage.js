import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import campusBg from '../assets/campus_lnmiit.jpg';

function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.navLogo} />
      </div>

      {/* CARD */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <div style={styles.portalTitle}>Director's Office Portal</div>
            <div style={styles.portalSub}>The LNM Institute of Information Technology</div>
          </div>

          <div style={styles.body}>
            <div style={styles.iconCircle}>✅</div>
            <div style={styles.heading}>Password Reset Successful!</div>
            <p style={styles.subtext}>
              Your password has been updated successfully.<br />
              You can now log in with your new password.
            </p>
            <div style={styles.redirectNote}>
              Redirecting to login in <strong style={{ color: '#1A3A6B' }}>3 seconds...</strong>
            </div>
            <button style={styles.btn} onClick={() => navigate('/')}>
              Go to Login →
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

const styles = {
  page:         { minHeight:'100vh', fontFamily:"'DM Sans',sans-serif", display:'flex', flexDirection:'column', position:'relative', backgroundImage:`url(${campusBg})`, backgroundSize:'cover', backgroundPosition:'center' },
  navbar:       { position:'fixed', top:0, left:0, right:0, height:'60px', background:'#fff', display:'flex', alignItems:'center', padding:'0 32px', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', zIndex:10 },
  navLogo:      { height:'40px', objectFit:'contain' },
  cardWrapper:  { flex:1, display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'60px', position:'relative', zIndex:1 },
  card:         { background:'#fff', borderRadius:'4px', boxShadow:'0 4px 24px rgba(0,0,0,0.12)', width:'400px', overflow:'hidden' },
  cardHeader:   { padding:'24px 32px 8px', textAlign:'center', borderBottom:'1px solid #f0f0f0' },
  portalTitle:  { fontSize:'20px', fontWeight:'700', color:'#1A3A6B', marginBottom:'4px' },
  portalSub:    { fontSize:'12px', color:'#64748b', marginBottom:'8px' },
  body:         { padding:'36px 32px', textAlign:'center' },
  iconCircle:   { fontSize:'48px', marginBottom:'16px' },
  heading:      { fontSize:'18px', fontWeight:'700', color:'#1E293B', marginBottom:'8px' },
  subtext:      { fontSize:'11px', color:'#64748B', lineHeight:1.6, marginBottom:'20px' },
  redirectNote: { fontSize:'11px', color:'#94A3B8', marginBottom:'20px' },
  btn:          { width:'100%', background:'#28a745', color:'#fff', border:'none', borderRadius:'4px', padding:'12px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
};

export default SuccessPage;