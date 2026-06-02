require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: 'https://anuwaryportfolio.vercel.app',
}));

// ── Nodemailer transporter (Gmail) ────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mwitikeanuwary@gmail.com',
    pass: process.env.GMAIL_PASS,  // ← App Password yako — weka Render tu, si hapa
  },
});

// ── Helper: validate email format ─────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── POST /api/contact ─────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { fullName, email, message } = req.body;

  // Validation
  if (!fullName || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (fullName.length > 100 || email.length > 200 || message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long.' });
  }

  // Email inayokwenda kwako (notification)
  const mailToYou = {
    from: '"Portfolio Contact" <mwitikeanuwary@gmail.com>',
    to: 'mwitikeanuwary@gmail.com',
    subject: `📩 Portfolio Message from ${fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 24px 32px;">
          <h2 style="margin: 0; font-size: 20px;">New message from your portfolio</h2>
        </div>
        <div style="padding: 28px 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 90px;">Name</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
              </td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">Message</p>
          <p style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 16px; border-radius: 4px; color: #1e293b; white-space: pre-wrap; margin: 0;">${message}</p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; font-size: 12px; color: #94a3b8; text-align: center;">
          Sent from your portfolio contact form
        </div>
      </div>
    `,
  };

  // Email ya auto-reply kwa mtu aliyetuma
  const mailToSender = {
    from: '"Anuwary Mwitike" <mwitikeanuwary@gmail.com>',
    to: email,
    subject: 'Thank you for reaching out!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; color: white; padding: 24px 32px;">
          <h2 style="margin: 0; font-size: 20px;">Thanks, ${fullName}! 👋</h2>
        </div>
        <div style="padding: 28px 32px; color: #1e293b;">
          <p>I received your message and I will get back to you as soon as possible.</p>
          <p style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 16px; border-radius: 4px; white-space: pre-wrap; color: #475569;">${message}</p>
          <p>Best regards,<br><strong>Anuwary Mwitike</strong></p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; font-size: 12px; color: #94a3b8; text-align: center;">
          mwitikeanuwary@gmail.com
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailToYou);
    await transporter.sendMail(mailToSender);
    return res.status(200).json({ success: true, message: 'Message sent!' });
  } catch (err) {
    console.error('Email send error:', err.message);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));


// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});gi
