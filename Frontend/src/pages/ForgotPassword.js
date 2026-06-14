import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import campusBg from '../assets/campus_lnmiit.jpg';

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

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.navLogo} />
        <span style={styles.navLink} onClick={() => navigate('/visitor-register')}>
          External visitor? Request an appointment here →
        </span>
      </div>

      {/* LOGIN CARD */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>

          <div style={styles.cardHeader}>
            <div style={styles.portalTitle}>Director's Office Portal</div>
            <div style={styles.portalSub}>The LNM Institute of Information Technology</div>
          </div>

          <form style={styles.form} onSubmit={handleSubmit}>
            <p style={styles.welcomeText}>Enter your registered email to receive an OTP</p>

            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <span style={styles.inputIcon}>✉</span>
            </div>

            {error && <div style={styles.errorBox}>❌ {error}</div>}

            <div style={styles.infoBox}>
              ⚠ OTP will be sent to this email. Valid for 10 minutes only.
            </div>

            <button style={{...styles.btnPrimary, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <button style={styles.btnSecondary} type="button" onClick={() => navigate('/')}>
              ← Back to Login
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

const styles = {
  page:        { minHeight:'100vh', fontFamily:"'DM Sans', sans-serif", display:'flex', flexDirection:'column', position:'relative', backgroundImage:`url(${campusBg})`, backgroundSize:'cover', backgroundPosition:'center' },
  navbar:      { position:'fixed', top:0, left:0, right:0, height:'60px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', zIndex:10 },
  navLogo:     { height:'40px', objectFit:'contain' },
  navLink:     { fontSize:'13px', color:'#2563EB', cursor:'pointer', fontWeight:'600' },
  cardWrapper: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'60px', position:'relative', zIndex:1 },
  card:        { background:'#fff', borderRadius:'4px', boxShadow:'0 4px 24px rgba(0,0,0,0.12)', width:'380px', overflow:'hidden' },
  cardHeader:  { padding:'24px 32px 8px', textAlign:'center', borderBottom:'1px solid #f0f0f0' },
  portalTitle: { fontSize:'20px', fontWeight:'700', color:'#1A3A6B', marginBottom:'4px' },
  portalSub:   { fontSize:'12px', color:'#64748b', marginBottom:'8px' },
  form:        { padding:'24px 32px' },
  welcomeText: { fontSize:'13px', color:'#444', textAlign:'center', marginBottom:'20px', marginTop:0 },
  inputWrap:   { position:'relative', marginBottom:'14px' },
  input:       { width:'100%', border:'1px solid #ccc', borderRadius:'4px', padding:'10px 36px 10px 12px', fontSize:'13px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  inputIcon:   { position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', color:'#888', cursor:'pointer' },
  errorBox:    { background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:'4px', padding:'8px 12px', fontSize:'11px', color:'#991B1B', marginBottom:'12px' },
  infoBox:     { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'4px', padding:'8px 12px', fontSize:'11px', color:'#92400E', marginBottom:'16px' },
  btnPrimary:  { width:'100%', background:'#28a745', color:'#fff', border:'none', borderRadius:'4px', padding:'11px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'10px' },
  btnSecondary:{ width:'100%', background:'#2563EB', color:'#fff', border:'none', borderRadius:'4px', padding:'11px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
};

export default ForgotPassword;