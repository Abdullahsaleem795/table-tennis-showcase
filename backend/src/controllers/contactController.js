const settingsService = require('../services/settingsService');
const emailService = require('../services/emailService');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format' });
    }

    const settings = await settingsService.getSettings();
    const adminEmail = settings.contactEmail;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3a2e22;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || '(no subject)')}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `;

    const { previewUrl } = await emailService.sendMail({
      from: emailService.buildFromAddress('Table Tennis Today'),
      to: adminEmail,
      replyTo: email,
      subject: `[Contact Form] ${subject || 'New message from ' + name}`,
      html: htmlContent,
    });

    res.json({ success: true, message: 'Message sent successfully', previewUrl });
  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
};
