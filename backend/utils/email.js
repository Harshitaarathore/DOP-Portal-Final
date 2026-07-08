const Brevo = require('@getbrevo/brevo');
require('dotenv').config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

// LNMIIT logo hosted publicly — used in all emails
const LOGO_URL = 'https://res.cloudinary.com/dnecujpt3/image/upload/v1783500960/lnmiit-logo_mcpcoj.jpg';

const baseTemplate = (content) => `<!DOCTYPE html>  
<html><head><title>LNMIIT Director's Office</title></head>
<body style="font-family:'Roboto',sans-serif;background:#f0f4fa;padding:40px 20px;margin:0;">
  <table style="background:#fff;width:100%;max-width:560px;margin:auto;border:1px solid #ddd;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <tr style="background:#1A3A6B;">
      <td style="text-align:center;padding:20px;">
        <img src="${LOGO_URL}" style="width:160px;background:#fff;padding:8px;border-radius:6px;" alt="LNMIIT Logo">
        <div style="color:#fff;font-size:13px;font-weight:700;margin-top:8px;">Director's Office</div>
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
        This is an automated message from Director's Office — LNMIIT. Please do not reply to this email.
      </td>
    </tr>
  </table>
</body></html>`;

const send = async (toEmail, subject, content) => {
  const mail = new Brevo.SendSmtpEmail();
  mail.to = [{ email: toEmail }];
  mail.sender = { email: 'gshar3010@gmail.com', name: "Director's Office - LNMIIT" };
  mail.subject = subject;
  mail.htmlContent = baseTemplate(content);
  await apiInstance.sendTransacEmail(mail);
};

// 1 — OTP
const sendOTPEmail = async (toEmail, otp) => {
  await send(toEmail, "Director's Office — Password Reset OTP", `
    <p>Dear User,</p>
    <p>You have requested a password reset for your <b>Director's Office </b> account.</p>
    <p>Your One-Time Password (OTP):</p>
    <h2 style="color:#1A3A6B;letter-spacing:6px;text-align:center;background:#EFF6FF;padding:16px;border-radius:8px;">${otp}</h2>
    <p>This OTP is valid for <b>10 minutes only</b>. Do not share it with anyone.</p>
  `);
};

// 2 — Meeting request submitted confirmation to requester
const sendMeetingSubmittedEmail = async (toEmail, requesterName, purpose, preferredDate, priority) => {
  await send(toEmail, "Director's Office — Meeting Request Received", `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>Your meeting request has been <b>received</b> by the Director's Office and is currently under review.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">Purpose</td><td style="padding:8px 12px;">${purpose}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;">Preferred Date</td><td style="padding:8px 12px;">${preferredDate || 'Not specified'}</td></tr>
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">Priority</td><td style="padding:8px 12px;">${priority}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;">Status</td><td style="padding:8px 12px;color:#92400E;font-weight:bold;">⏳ Pending Review</td></tr>
    </table>
    <p>You will receive an email once your request is reviewed. For urgent matters, contact the Director's Office directly.</p>
  `);
};

// 3 — Meeting approved
const sendMeetingApprovedEmail = async (toEmail, requesterName, purpose, preferredDate) => {
  await send(toEmail, "Director's Office — Meeting Request Approved ✓", `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>Your meeting request has been <b style="color:green;">approved</b> by the Director's Office.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">Purpose</td><td style="padding:8px 12px;">${purpose}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;">Preferred Date</td><td style="padding:8px 12px;">${preferredDate || 'To be confirmed'}</td></tr>
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">Status</td><td style="padding:8px 12px;color:green;font-weight:bold;">✓ Approved</td></tr>
    </table>
    <p>Please arrive on time and carry your institutional ID.</p>
  `);
};

// 4 — Meeting rejected with reason
const sendMeetingRejectedEmail = async (toEmail, requesterName, purpose, reason) => {
  await send(toEmail, "Director's Office — Meeting Request Update", `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>Your meeting request has been <b style="color:#DC2626;">rejected</b> by the Director's Office.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">Purpose</td><td style="padding:8px 12px;">${purpose}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;">Status</td><td style="padding:8px 12px;color:#DC2626;font-weight:bold;">✗ Rejected</td></tr>
      ${reason ? `<tr style="background:#FEE2E2;"><td style="padding:8px 12px;font-weight:bold;">Reason</td><td style="padding:8px 12px;">${reason}</td></tr>` : ''}
    </table>
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;">
      💡 You may submit a new request with a different time slot or contact the Director's Office for clarification.
    </div>
  `);
};

// 5 — Meeting rescheduled
const sendMeetingRescheduledEmail = async (toEmail, requesterName, purpose, newDate, newTime) => {
  await send(toEmail, "Director's Office — Meeting Rescheduled", `
    <p>Dear <b>${requesterName}</b>,</p>
    <p>Your meeting request has been <b style="color:#1A3A6B;">rescheduled</b> by the Director's Office.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">Purpose</td><td style="padding:8px 12px;">${purpose}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;">New Date</td><td style="padding:8px 12px;">${newDate || 'To be confirmed'}</td></tr>
      <tr style="background:#EFF6FF;"><td style="padding:8px 12px;font-weight:bold;">New Time</td><td style="padding:8px 12px;">${newTime || 'To be confirmed'}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:bold;">Status</td><td style="padding:8px 12px;color:#1A3A6B;font-weight:bold;">🔄 Rescheduled</td></tr>
    </table>
    <p>Please confirm your availability for the new slot. If this time does not work, you may submit a new request.</p>
  `);
};

// 6 — Visitor approved
const sendVisitorApprovedEmail = async (toEmail, visitorName, organization, visitDate, visitTime) => {
  const dateObj = new Date(visitDate);
  const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'Asia/Kolkata' });
  await send(toEmail, "Director's Office — Visitor Request Approved ✓", `
    <p>Dear <b>${visitorName}</b>,</p>
    <p>Your visit request to <b>LNMIIT, Jaipur</b> has been <b style="color:green;">approved</b>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#1A3A6B;"><td colspan="2" style="padding:10px 14px;color:#fff;font-weight:bold;">Visit Details</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;width:40%;">Visitor Name</td><td style="padding:10px 14px;">${visitorName}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:bold;">Organization</td><td style="padding:10px 14px;">${organization}</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;">Visit Date</td><td style="padding:10px 14px;">${formattedDate}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:bold;">Visit Time</td><td style="padding:10px 14px;">${visitTime}</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;">Status</td><td style="padding:10px 14px;color:green;font-weight:bold;">✓ Approved</td></tr>
    </table>
    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#1E40AF;">
      ℹ️ Please carry a valid photo ID and report to the security gate. Show this email as your entry confirmation.
    </div>
    <p style="color:#475569;font-size:12px;">For queries, contact: <a href="mailto:director@lnmiit.ac.in">director@lnmiit.ac.in</a></p>
  `);
};

// 7 — Visitor rejected with reason
const sendVisitorRejectedEmail = async (toEmail, visitorName, organization, visitDate, reason) => {
  const dateObj = new Date(visitDate);
  const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'Asia/Kolkata' });
  await send(toEmail, "Director's Office — Visitor Request Update", `
    <p>Dear <b>${visitorName}</b>,</p>
    <p>Your visit request to <b>LNMIIT, Jaipur</b> has been <b style="color:#DC2626;">rejected</b>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#1A3A6B;"><td colspan="2" style="padding:10px 14px;color:#fff;font-weight:bold;">Visit Details</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;width:40%;">Visitor Name</td><td style="padding:10px 14px;">${visitorName}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:bold;">Organization</td><td style="padding:10px 14px;">${organization}</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;">Requested Date</td><td style="padding:10px 14px;">${formattedDate}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:bold;">Status</td><td style="padding:10px 14px;color:#DC2626;font-weight:bold;">✗ Rejected</td></tr>
      ${reason ? `<tr style="background:#FEE2E2;"><td style="padding:10px 14px;font-weight:bold;">Reason</td><td style="padding:10px 14px;">${reason}</td></tr>` : ''}
    </table>
    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;">
      💡 You may submit a new visit request with a different date/time, or contact the Director's Office for clarification.
    </div>
  `);
};

// 8 — Visitor rescheduled
const sendVisitorRescheduledEmail = async (toEmail, visitorName, organization, newDate, newTime) => {
  const dateObj = new Date(newDate);
  const formattedDate = dateObj.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'Asia/Kolkata' });
  await send(toEmail, "Director's Office — Visit Rescheduled", `
    <p>Dear <b>${visitorName}</b>,</p>
    <p>Your visit to <b>LNMIIT, Jaipur</b> has been <b style="color:#1A3A6B;">rescheduled</b>.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#1A3A6B;"><td colspan="2" style="padding:10px 14px;color:#fff;font-weight:bold;">Updated Visit Details</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;width:40%;">Organization</td><td style="padding:10px 14px;">${organization}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:bold;">New Visit Date</td><td style="padding:10px 14px;">${formattedDate}</td></tr>
      <tr style="background:#f0f4fa;"><td style="padding:10px 14px;font-weight:bold;">New Visit Time</td><td style="padding:10px 14px;">${newTime}</td></tr>
      <tr><td style="padding:10px 14px;font-weight:bold;">Status</td><td style="padding:10px 14px;color:#1A3A6B;font-weight:bold;">🔄 Rescheduled</td></tr>
    </table>
    <p>Please confirm your availability. Carry a valid photo ID on your visit day.</p>
  `);
};

module.exports = {
  sendOTPEmail,
  sendMeetingSubmittedEmail,
  sendMeetingApprovedEmail,
  sendMeetingRejectedEmail,
  sendMeetingRescheduledEmail,
  sendVisitorApprovedEmail,
  sendVisitorRejectedEmail,
  sendVisitorRescheduledEmail,
};