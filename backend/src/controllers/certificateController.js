const nodemailer = require('nodemailer');
const playerService = require('../services/playerService');

// In-memory transport cache so we don't recreate ethereal accounts on every request if using test mode
let cachedTransporter = null;
let testAccountDetails = null;

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

  // Otherwise, create a test Ethereal account
  const testAccount = await nodemailer.createTestAccount();
  testAccountDetails = testAccount;
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

exports.sendCertificate = async (req, res) => {
  try {
    const { playerId, placement } = req.body;
    if (!playerId || !placement) {
      return res.status(400).json({ error: 'Player ID and placement are required' });
    }

    const player = await playerService.getById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (!player.email) return res.status(400).json({ error: 'Player does not have an email address' });

    let titleText = 'Certificate of Appreciation';
    let bodyText = `for successfully participating in the FFL Smash tournament.`;
    let colorScheme = '#6b5c4a'; // default brownish
    let ribbonHtml = '';

    if (placement === 'Winner') {
      titleText = 'Certificate of Achievement';
      bodyText = `for winning 1st Place in the FFL Smash tournament! Outstanding performance.`;
      colorScheme = '#d4af37'; // gold
      ribbonHtml = `<div style="font-size: 40px; margin-bottom: 10px;">🏆 1st Place</div>`;
    } else if (placement === 'Runner-up') {
      titleText = 'Certificate of Achievement';
      bodyText = `for securing 2nd Place in the FFL Smash tournament! Incredible skill.`;
      colorScheme = '#c0c0c0'; // silver
      ribbonHtml = `<div style="font-size: 40px; margin-bottom: 10px;">🥈 2nd Place</div>`;
    } else if (placement === '3rd Place') {
      titleText = 'Certificate of Achievement';
      bodyText = `for achieving 3rd Place in the FFL Smash tournament! Great effort.`;
      colorScheme = '#cd7f32'; // bronze
      ribbonHtml = `<div style="font-size: 40px; margin-bottom: 10px;">🥉 3rd Place</div>`;
    } else {
      ribbonHtml = `<div style="font-size: 40px; margin-bottom: 10px;">🏅 Participant</div>`;
    }

    const htmlContent = `
      <div style="background-color: #f7f2e9; padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center;">
        <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 8px solid ${colorScheme}; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px;">
          
          <h1 style="font-size: 48px; color: ${colorScheme}; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">
            ${titleText}
          </h1>
          
          <h2 style="font-size: 24px; color: #3a2e22; margin-bottom: 40px;">
            FFL Smash
          </h2>
          
          <p style="font-size: 18px; color: #6b5c4a; margin-bottom: 20px; font-style: italic;">
            This certificate is proudly presented to
          </p>
          
          <h3 style="font-size: 36px; color: #3a2e22; margin-bottom: 20px; border-bottom: 2px solid ${colorScheme}; display: inline-block; padding-bottom: 5px;">
            ${player.name}
          </h3>
          
          ${ribbonHtml}

          <p style="font-size: 20px; color: #3a2e22; margin-bottom: 50px; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.5;">
            ${bodyText}
          </p>
          
          <div style="display: flex; justify-content: center; gap: 100px; margin-top: 60px;">
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #3a2e22; width: 200px; margin-bottom: 10px;"></div>
              <p style="font-size: 14px; color: #6b5c4a; margin: 0;">Tournament Director</p>
            </div>
            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #3a2e22; width: 200px; margin-bottom: 10px;">
                <span style="font-style: italic;">${new Date().toLocaleDateString()}</span>
              </div>
              <p style="font-size: 14px; color: #6b5c4a; margin: 0;">Date</p>
            </div>
          </div>
          
        </div>
      </div>
    `;

    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from: '"FFL Smash Tournament" <no-reply@fflsmash.com>',
      to: player.email,
      subject: `Your ${titleText} - FFL Smash`,
      html: htmlContent,
    });

    let previewUrl = null;
    if (!process.env.SMTP_HOST) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Test Certificate Preview URL: %s', previewUrl);
    }

    res.json({ success: true, message: 'Certificate sent successfully', previewUrl });
  } catch (error) {
    console.error('Error sending certificate:', error);
    res.status(500).json({ error: 'Failed to send certificate', details: error.message });
  }
};
