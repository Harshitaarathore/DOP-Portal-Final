const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'DOP Portal - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };