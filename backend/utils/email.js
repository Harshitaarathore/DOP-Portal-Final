const Brevo = require('@getbrevo/brevo');
require('dotenv').config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

const baseTemplate = (content) => `<!DOCTYPE html>
<html><head><title>LNMIIT DOP Portal</title></head>
<body style="font-family:'Roboto',sans-serif;background:#f0f4fa;padding:40px 20px;margin:0;">
  <table style="background:#fff;width:100%;max-width:560px;margin:auto;border:1px solid #ddd;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <tr style="background:#1A3A6B;">
      <td style="text-align:center;padding:20px;">
        <img src="https://lnmiit.ac.in/wp-content/uploads/2022/05/LNMIIT-Logo.png" style="width:160px;background:#fff;padding:8px;border-radius:6px;">
        <div style="color:#fff;font-size:13px;font-weight:700;margin-top:8px;">Director's Office Portal</div>
        <div style="color:rgba(255,255,255,0.7);font-size:10px;">The LNM Institute of Information Technology, Jaipur</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;font-size:14px;color:#1E293B;line-height:1.7;">
        ${content}
      </td>
    </tr>
    <tr style="background:#F8FAFC;">
      <td style="padding:16px 32px;text-align:center;font-size:11px;color:#94A3B8;border-top:1px solid #E2E8F0;">
        This is an automated message from DOP Portal — LNMIIT. Please do not reply to this email.
      </td>
    </tr>
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
  
  // Format date properly
  const dateObj = new Date(visitDate);
  const formattedDate = dateObj.toLocaleDateString('en-IN', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata'
  });

  const content = `
    <p style="font-size:15px;">Dear <b>${visitorName}</b>,</p>
    <p>Your visit request to <b>The LNM Institute of Information Technology, Jaipur</b> has been <b style="color:green;">approved</b>.</p>
    
    <table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:8px;overflow:hidden;">
      <tr style="background:#1A3A6B;">
        <td colspan="2" style="padding:10px 14px;color:#fff;font-weight:bold;font-size:13px;">Visit Details</td>
      </tr>
      <tr style="background:#f0f4fa;">
        <td style="padding:10px 14px;font-weight:bold;width:40%;">Visitor Name</td>
        <td style="padding:10px 14px;">${visitorName}</td>
      </tr>
      <tr style="background:#fff;">
        <td style="padding:10px 14px;font-weight:bold;">Organization</td>
        <td style="padding:10px 14px;">${organization}</td>
      </tr>
      <tr style="background:#f0f4fa;">
        <td style="padding:10px 14px;font-weight:bold;">Visit Date</td>
        <td style="padding:10px 14px;">${formattedDate}</td>
      </tr>
      <tr style="background:#fff;">
        <td style="padding:10px 14px;font-weight:bold;">Visit Time</td>
        <td style="padding:10px 14px;">${visitTime}</td>
      </tr>
      <tr style="background:#f0f4fa;">
        <td style="padding:10px 14px;font-weight:bold;">Status</td>
        <td style="padding:10px 14px;color:green;font-weight:bold;">✓ Approved</td>
      </tr>
    </table>

    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#1E40AF;">
      ℹ️ Please carry a valid photo ID and report to the security gate on your visit day. Show this email as your entry confirmation.
    </div>

    <p style="color:#475569;font-size:12px;">For any queries, contact the Director's Office at <a href="mailto:director@lnmiit.ac.in">director@lnmiit.ac.in</a></p>
  `;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.sender = { email: 'gshar3010@gmail.com', name: 'DOP Portal - LNMIIT' };
  sendSmtpEmail.subject = 'DOP Portal — Visitor Request Approved ✓';
  sendSmtpEmail.htmlContent = baseTemplate(content);

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = { sendOTPEmail, sendMeetingApprovedEmail, sendMeetingRejectedEmail, sendVisitorApprovedEmail };