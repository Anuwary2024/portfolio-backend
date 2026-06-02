app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        error: 'Please fill in all fields.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format.'
      });
    }

    const mailToYou = {
      from: '"Portfolio Contact" <mwitikeanuwary@gmail.com>',
      to: 'mwitikeanuwary@gmail.com',
      subject: `Portfolio Message from ${fullName}`,
      html: `
        <h2>New Portfolio Message</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    const mailToSender = {
      from: '"Anuwary Mwitike" <mwitikeanuwary@gmail.com>',
      to: email,
      subject: 'Thank you for reaching out!',
      html: `
        <h2>Thank you, ${fullName}!</h2>
        <p>I received your message and will get back to you soon.</p>
        <p>Best regards,<br><strong>Anuwary Mwitike</strong></p>
      `
    };

    await transporter.sendMail(mailToYou);
    await transporter.sendMail(mailToSender);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to send message'
    });
  }
});