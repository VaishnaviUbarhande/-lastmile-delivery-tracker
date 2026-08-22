const nodemailer = require('nodemailer');

let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return twilioClient;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const isDryRun = () => process.env.NOTIFICATIONS_DRY_RUN === 'true';

async function sendEmail({ to, subject, html, text }) {
  if (isDryRun()) {
    console.log(`[EMAIL:DRY_RUN] to=${to} subject="${subject}"`);
    return { dryRun: true };
  }
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    return info;
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}: ${err.message}`);
    return { error: err.message };
  }
}

async function sendSMS({ to, body }) {
  if (isDryRun()) {
    console.log(`[SMS:DRY_RUN] to=${to} body="${body}"`);
    return { dryRun: true };
  }
  const client = getTwilioClient();
  if (!client) {
    console.warn('[SMS] Twilio not configured, skipping SMS send');
    return { skipped: true };
  }
  try {
    return await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body,
    });
  } catch (err) {
    console.error(`[SMS] Failed to send to ${to}: ${err.message}`);
    return { error: err.message };
  }
}

/**
 * Sends a status-change notification to the customer via email (always)
 * and SMS (best-effort). Non-blocking failures are logged, not thrown -
 * notification failures must never break the order status update flow.
 */
async function notifyOrderStatusChange({ customer, order, status, extra = '' }) {
  const subject = `Order ${order.orderNumber} - Status Update: ${status}`;
  const html = `
    <p>Hi ${customer.name},</p>
    <p>Your order <strong>${order.orderNumber}</strong> status has been updated to:</p>
    <h3>${status}</h3>
    ${extra ? `<p>${extra}</p>` : ''}
    <p>Pickup: ${order.pickupAddress.line1}, ${order.pickupAddress.city}</p>
    <p>Drop: ${order.dropAddress.line1}, ${order.dropAddress.city}</p>
    <p>Track your order anytime by logging into your dashboard.</p>
  `;

  const results = await Promise.allSettled([
    sendEmail({ to: customer.email, subject, html }),
    sendSMS({
      to: customer.phone,
      body: `Order ${order.orderNumber}: status updated to ${status}. ${extra}`,
    }),
  ]);

  return results;
}

module.exports = { sendEmail, sendSMS, notifyOrderStatusChange };
