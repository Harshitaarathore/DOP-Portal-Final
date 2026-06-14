import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import campusBg from '../assets/campus_lnmiit.jpg';

function OTPVerification() {
  const [otp, setOtp] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [expired, setExpired] = useState(false);
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

  React.useEffect(() => {
  if (timeLeft <= 0) {
    setExpired(true);
    return;
  }
  const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
  return () => clearTimeout(timer);
}, [timeLeft]);

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
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
            <p style={styles.welcomeText}>Enter the 6-digit OTP sent to your email</p>

            <div style={styles.emailSent}>
              OTP sent to: <strong style={{color:'#1A3A6B'}}>{email}</strong>
            </div>

            <div style={styles.otpRow}>
              {otp.map((val, i) => (
                <input
                key={i}
                id={`otp-${i}`}
                style={{...styles.otpBox, background: expired ? '#F1F5F9' : '#fff', cursor: expired ? 'not-allowed' : 'text'}}
                type="text"
                maxLength="1"
                value={val}
                onChange={e => !expired && handleChange(e.target.value, i)}
                onKeyDown={e => !expired && handleKeyDown(e, i)}
                disabled={expired}
                />
              ))}
            </div>

            {error && <div style={styles.errorBox}>❌ {error}</div>}

            <div style={{...styles.infoBox, background: expired ? '#FEE2E2' : '#FEF3C7', border: expired ? '1px solid #FCA5A5' : '1px solid #FDE68A', color: expired ? '#991B1B' : '#92400E'}}>
              {expired ? '❌ OTP expired! Please go back and request a new one.' : `⏱ OTP expires in: ${formatTime(timeLeft)}`}
            </div>

            <button style={{...styles.btnPrimary, opacity: (loading || expired) ? 0.5 : 1}} type="submit" disabled={loading || expired}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button style={styles.btnSecondary} type="button" onClick={() => navigate('/forgot-password')}>
              ← Back
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
  card:        { background:'#fff', borderRadius:'4px', boxShadow:'0 4px 24px rgba(0,0,0,0.12)', width:'400px', overflow:'hidden' },
  cardHeader:  { padding:'24px 32px 8px', textAlign:'center', borderBottom:'1px solid #f0f0f0' },
  portalTitle: { fontSize:'20px', fontWeight:'700', color:'#1A3A6B', marginBottom:'4px' },
  portalSub:   { fontSize:'12px', color:'#64748b', marginBottom:'8px' },
  form:        { padding:'24px 32px' },
  welcomeText: { fontSize:'13px', color:'#444', textAlign:'center', marginBottom:'14px', marginTop:0 },
  emailSent:   { background:'#F0F4FA', borderRadius:'4px', padding:'8px 12px', fontSize:'11px', color:'#475569', marginBottom:'16px', textAlign:'center' },
  otpRow:      { display:'flex', gap:'8px', justifyContent:'center', marginBottom:'14px' },
  otpBox:      { width:'44px', height:'48px', textAlign:'center', fontSize:'20px', fontWeight:'700', border:'1px solid #ccc', borderRadius:'4px', color:'#1E293B', outline:'none', boxSizing:'border-box' },
  errorBox:    { background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:'4px', padding:'8px 12px', fontSize:'11px', color:'#991B1B', marginBottom:'12px' },
  infoBox:     { background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius:'4px', padding:'8px 12px', fontSize:'11px', color:'#92400E', marginBottom:'16px' },
  btnPrimary:  { width:'100%', background:'#28a745', color:'#fff', border:'none', borderRadius:'4px', padding:'11px', fontSize:'14px', fontWeight:'600', cursor:'pointer', marginBottom:'10px' },
  btnSecondary:{ width:'100%', background:'#2563EB', color:'#fff', border:'none', borderRadius:'4px', padding:'11px', fontSize:'14px', fontWeight:'600', cursor:'pointer' },
};

export default OTPVerification;