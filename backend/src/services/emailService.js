const nodemailer = require('nodemailer');

// In-memory transport cache so we don't recreate ethereal accounts on every request if using test mode
let cachedTransporter = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // If real SMTP credentials exist in env, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // Otherwise, create a test Ethereal account (mail is never delivered to a real inbox,
  // only viewable via the preview URL returned by sendMail)
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return cachedTransporter;
}

// Most real SMTP providers (Gmail included) reject or silently rewrite the
// From header if it doesn't match the authenticated account, so the display
// name is configurable but the address always comes from the SMTP account.
function buildFromAddress(displayName) {
  const address = process.env.SMTP_USER || 'no-reply@fflsmash.com';
  return `"${displayName}" <${address}>`;
}

async function sendMail(options) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail(options);

  let previewUrl = null;
  if (!process.env.SMTP_HOST) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Test Email Preview URL: %s', previewUrl);
  }

  return { info, previewUrl };
}

module.exports = { getTransporter, sendMail, buildFromAddress };
