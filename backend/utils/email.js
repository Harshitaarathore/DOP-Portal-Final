const Brevo = require('@getbrevo/brevo');
require('dotenv').config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

const baseTemplate = (content) => `<!DOCTYPE html>
<html><head><title>LNMIIT DOP Portal</title></head>
<body style="font-family:Roboto,sans-serif;background:#eee;padding:40px;">
  <table style="background:#fff;width:550px;margin:auto;border:1px solid #ccc;border-radius:10px;">
    <tr style="background:#EEEEEE;">
      <td style="text-align:center;padding:10px;">
        <img src="https://lnmiit.ac.in/wp-content/uploads/2022/05/LNMIIT-Logo.png" style="width:200px;">
      </td>
    </tr>
    <tr><td style="padding:20px 30px;font-size:14px;">${content}</td></tr>
    <tr><td style="padding:10px 30px;font-size:14px;">
      <p>Best regards,</p>
      <p><b>Director's Office — LNMIIT</b></p>
      <p>DOP Portal | dop@lnmiit.ac.in</p>
    </td></tr>
  </table>
</body></html>`;

const sendOTPEmail = async (toEmail, otp) => {
  const content = `
    <p>Dear User,</p>
    <p>You have requested a password reset for your <b>DOP Portal</b> account.</p>
    <p>Your One-Time Password (OTP):</p>
    <h2 style="color:#034da2;letter-spacing:6px;text-align:center;">${otp}</h2>
    <p>This OTP is valid for <b>10 minutes only</b>. Do not share it with anyone.</p>
  `;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: 'gshar3010@gmail.com', name: 'DOP Portal - LNMIIT' };
  sendSmtpEmail.subject = 'DOP Portal — Password Reset OTP';
  sendSmtpEmail.htmlContent = baseTemplate(content);

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

const sendMeetingApprovedEmail = async (toEmail, requesterName, purpose, preferredDate) => {
  const content = `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>Your meeting request has been <b style="color:green;">approved</b> by the Director's Office.</p>
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
    <p>Please arrive on time and carry your institutional ID.</p>
  `;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: 'gshar3010@gmail.com', name: 'DOP Portal - LNMIIT' };
  sendSmtpEmail.subject = 'DOP Portal — Meeting Request Approved';
  sendSmtpEmail.htmlContent = baseTemplate(content);

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

const sendMeetingRejectedEmail = async (toEmail, requesterName, purpose) => {
  const content = `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>Your meeting request has been <b style="color:red;">rejected</b> by the Director's Office.</p>
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
    <p>You may submit a new request or contact the Director's Office for clarification.</p>
  `;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: 'gshar3010@gmail.com', name: 'DOP Portal - LNMIIT' };
  sendSmtpEmail.subject = 'DOP Portal — Meeting Request Rejected';
  sendSmtpEmail.htmlContent = baseTemplate(content);

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

// 4 — Visitor Approved Email
const sendVisitorApprovedEmail = async (toEmail, visitorName, organization, visitDate, visitTime) => {
  const content = `
    <p>Dear <b>${visitorName}</b>,</p>
    <p>Your visit request to <b>The LNM Institute of Information Technology, Jaipur</b> has been <b style="color:green;">approved</b>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f0f4fa;">
        <td style="padding:8px 12px;font-weight:bold;">Visitor Name</td>
        <td style="padding:8px 12px;">${visitorName}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;">Organization</td>
        <td style="padding:8px 12px;">${organization}</td>
      </tr>
      <tr style="background:#f0f4fa;">
        <td style="padding:8px 12px;font-weight:bold;">Visit Date</td>
        <td style="padding:8px 12px;">${visitDate}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;">Visit Time</td>
        <td style="padding:8px 12px;">${visitTime}</td>
      </tr>
      <tr style="background:#f0f4fa;">
        <td style="padding:8px 12px;font-weight:bold;">Status</td>
        <td style="padding:8px 12px;color:green;font-weight:bold;">Approved</td>
      </tr>
    </table>
    <p>Please carry a valid photo ID and report to the security gate on your visit day. Show this email as your entry confirmation.</p>
    <p>For any queries, contact the Director's Office at LNMIIT.</p>
  `;

  await transporter.sendMail({
    from: `"DOP Portal - LNMIIT" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'DOP Portal — Visitor Request Approved',
    html: baseTemplate(content)
  });
};

module.exports = { sendOTPEmail, sendMeetingApprovedEmail, sendMeetingRejectedEmail, sendVisitorApprovedEmail };