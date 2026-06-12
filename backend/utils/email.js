const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Base HTML template (LNMIIT style)
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <title>The LNM Institute of Information Technology, Jaipur</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">
</head>
<body>
  <table style="background:#eee;padding:40px;border:1px solid #ddd;margin:0 auto;font-family:'Roboto',sans-serif;">
    <tbody>
      <tr>
        <td>
          <table style="background:#fff;width:550px;border:1px solid #ccc;padding:0;margin:0;border-collapse:collapse;border-radius:10px;">
            <tbody style="border:solid 1px #034da2;">
              <tr style="background:#EEEEEE;">
                <td>
                  <center>
                    <img src="https://lnmiit.ac.in/wp-content/uploads/2022/05/LNMIIT-Logo.png" 
                         style="width:200px;margin:auto;display:block;padding:10px;">
                  </center>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 30px;margin:0;text-align:left;font-family:'Roboto',sans-serif;font-size:14px;">
                  ${content}
                </td>
              </tr>
              <tr>
                <td style="padding:10px 30px;margin:0;text-align:left;font-family:'Roboto',sans-serif;font-size:14px;">
                  <br/>
                  <p>Best regards,</p>
                  <p><b>Director's Office — LNMIIT</b></p>
                  <p>DOP Portal | dop@lnmiit.ac.in</p>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

// 1 — OTP Email
const sendOTPEmail = async (toEmail, otp) => {
  const content = `
    <p>Dear User,</p>
    <p>You have requested a password reset for your <b>DOP Portal</b> account at The LNM Institute of Information Technology.</p>
    <p>Your One-Time Password (OTP):</p>
    <h2 style="color:#034da2;letter-spacing:6px;text-align:center;">${otp}</h2>
    <p>This OTP is valid for <b>10 minutes only</b>. Do not share it with anyone.</p>
    <p>If you did not request this, please contact the Director's Office immediately at webmaster@lnmiit.ac.in.</p>
  `;

  await transporter.sendMail({
    from: `"DOP Portal - LNMIIT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'DOP Portal — Password Reset OTP',
    html: baseTemplate(content)
  });
};

// 2 — Meeting Approved Email
const sendMeetingApprovedEmail = async (toEmail, requesterName, purpose, preferredDate) => {
  const content = `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>We are pleased to inform you that your meeting request has been <b style="color:green;">approved</b> by the Director's Office.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f0f4fa;">
        <td style="padding:8px 12px;font-weight:bold;">Purpose</td>
        <td style="padding:8px 12px;">${purpose}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;">Preferred Date</td>
        <td style="padding:8px 12px;">${preferredDate || 'To be confirmed'}</td>
      </tr>
      <tr style="background:#f0f4fa;">
        <td style="padding:8px 12px;font-weight:bold;">Status</td>
        <td style="padding:8px 12px;color:green;font-weight:bold;">Approved</td>
      </tr>
    </table>
    <p>Please arrive on time and carry your institutional ID. For any changes, contact the Director's Office.</p>
  `;

  await transporter.sendMail({
    from: `"DOP Portal - LNMIIT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'DOP Portal — Meeting Request Approved',
    html: baseTemplate(content)
  });
};

// 3 — Meeting Rejected Email
const sendMeetingRejectedEmail = async (toEmail, requesterName, purpose) => {
  const content = `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>We regret to inform you that your meeting request has been <b style="color:red;">rejected</b> by the Director's Office.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f0f4fa;">
        <td style="padding:8px 12px;font-weight:bold;">Purpose</td>
        <td style="padding:8px 12px;">${purpose}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;">Status</td>
        <td style="padding:8px 12px;color:red;font-weight:bold;">Rejected</td>
      </tr>
    </table>
    <p>You may submit a new request with additional details or contact the Director's Office for further clarification.</p>
  `;

  await transporter.sendMail({
    from: `"DOP Portal - LNMIIT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'DOP Portal — Meeting Request Rejected',
    html: baseTemplate(content)
  });
};

module.exports = { sendOTPEmail, sendMeetingApprovedEmail, sendMeetingRejectedEmail };  