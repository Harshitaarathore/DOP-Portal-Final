import API from '../api';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import lnmiitLogo from '../assets/lnmiit-logo.png';
import campusBg from '../assets/campus_lnmiit.jpg';

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
        alert(res.data.message || 'Login failed');
      }
    } catch (err) {
      alert('Login failed. Make sure backend is running.');
    }
  };

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <img src={lnmiitLogo} alt="LNMIIT Logo" style={styles.navLogo} />
        <span style={styles.navLink} onClick={() => navigate('/visitor-register')}>
          External Visitor ? Request an appointment here →
        </span>
      </div>

      {/* BACKGROUND IMAGE */}
      <div style={styles.bgOverlay} />

      {/* LOGIN CARD */}
      <div style={styles.cardWrapper}>
        <div style={styles.card}>

          {/* HEADER */}
          <div style={styles.cardHeader}>
            <div style={styles.portalTitle}>Director's Office Portal</div>
            <div style={styles.portalSub}>The LNM Institute of Information Technology</div>
          </div>

          {/* FORM */}
          <form style={styles.form} onSubmit={handleLogin}>
            <p style={styles.welcomeText}>Welcome! Sign in to start your session</p>

            {/* Email */}
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span style={styles.inputIcon}>✉</span>
            </div>

            {/* Password */}
            <div style={styles.inputWrap}>
              <input
                style={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                style={styles.inputIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>

            {/* Buttons */}
            <button style={styles.btnSignIn} type="submit">Sign In</button>
            <button
              style={styles.btnForgot}
              type="button"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundImage: `url(${campusBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  // bgOverlay: {
  //   position: 'fixed',
  //   top: 0, left: 0, right: 0, bottom: 0,
  //   background: 'rgba(255,255,255,0.45)',
  //   zIndex: 0,
  // },
  navbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: '60px',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    zIndex: 10,
  },
  navLogo: {
    height: '40px',
    objectFit: 'contain',
  },
  navLink: { fontSize:'13px', color:'#2563EB', cursor:'pointer', fontWeight:'600', textAlign:'right', lineHeight:'1.5' },

  cardWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '60px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    width: '380px',
    overflow: 'hidden',
  },
  cardHeader: {
    background: '#fff',
    padding: '24px 32px 8px',
    textAlign: 'center',
    borderBottom: '1px solid #f0f0f0',
  },
  portalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A3A6B',
    marginBottom: '4px',
  },
  portalSub: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '8px',
  },
  form: {
    padding: '24px 32px',
  },
  welcomeText: {
    fontSize: '13px',
    color: '#444',
    textAlign: 'center',
    marginBottom: '20px',
    marginTop: 0,
  },
  inputWrap: {
    position: 'relative',
    marginBottom: '14px',
  },
  input: {
    width: '100%',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px 36px 10px 12px',
    fontSize: '13px',
    color: '#1E293B',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '14px',
    color: '#888',
    cursor: 'pointer',
  },
  btnSignIn: {
    width: '100%',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '11px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  btnForgot: {
    width: '100%',
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '11px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Login;