const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { generateOTP, getExpiryTime } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');
require('dotenv').config();

const logAudit = (user_id, action, module) => {
  const { v4: uuidv4 } = require('uuid');
  const sql = `INSERT INTO audit_logs (id, user_id, action, module) VALUES (?, ?, ?, ?)`;
  db.query(sql, [uuidv4(), user_id, action, module], (err) => {
    if (err) console.log('Audit log error:', err.message);
  });
};

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.query(sql, [email], (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    if (results.length === 0) return res.json({ success: false, message: 'User not found', data: null });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) return res.json({ success: false, message: 'Invalid credentials', data: null });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    logAudit(user.id, 'LOGIN', 'Auth');

    res.json({
      success: true,
      message: 'Login successful',
      data: { token, role: user.role, name: user.name, email: user.email }
    });
  });
};

// FORGOT PASSWORD - send OTP
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    if (results.length === 0) return res.json({ success: false, message: 'Email not found', data: null });

    const otp = generateOTP();
    const expiresAt = getExpiryTime();
    const id = uuidv4();

    const insertSql = `INSERT INTO otps (id, email, otp_code, expires_at) VALUES (?, ?, ?, ?)`;

    db.query(insertSql, [id, email, otp, expiresAt], async (err2) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });

      try {
        await sendOTPEmail(email, otp);
        res.json({ success: true, message: 'OTP sent to email', data: null });
      } catch (emailErr) {
        res.json({ success: false, message: 'Failed to send email', data: null });
      }
    });
  });
};

// VERIFY OTP
const verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  const sql = `SELECT * FROM otps WHERE email = ? AND otp_code = ? AND used = 0 ORDER BY expires_at DESC LIMIT 1`;

  db.query(sql, [email, otp], (err, results) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    if (results.length === 0) return res.json({ success: false, message: 'Invalid OTP', data: null });

    const otpRecord = results[0];
    const now = new Date();

    if (now > new Date(otpRecord.expires_at)) {
      return res.json({ success: false, message: 'OTP expired', data: null });
    }

    const updateSql = `UPDATE otps SET used = 1 WHERE id = ?`;
    db.query(updateSql, [otpRecord.id], (err2) => {
      if (err2) return res.json({ success: false, message: err2.message, data: null });
      res.json({ success: true, message: 'OTP verified', data: null });
    });
  });
};

// RESET PASSWORD
const resetPassword = (req, res) => {
  const { email, newPassword } = req.body;

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const sql = `UPDATE users SET password = ? WHERE email = ?`;

  db.query(sql, [hashedPassword, email], (err) => {
    if (err) return res.json({ success: false, message: err.message, data: null });
    res.json({ success: true, message: 'Password reset successful', data: null });
  });
};

module.exports = { login, forgotPassword, verifyOTP, resetPassword };