const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const useResend = process.env.EMAIL_PROVIDER === 'resend' || !!process.env.RESEND_API_KEY;
  const htmlBody =
    typeof options.html === 'string'
      ? options.html
      : options.html === true
        ? options.message
        : null;

  if (useResend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is missing');
    }

    const payload = {
      from: `${process.env.FROM_NAME || 'Campusly'} <${process.env.FROM_EMAIL}>`,
      to: [options.email],
      subject: options.subject,
      text: options.message,
      ...(htmlBody ? { html: htmlBody } : {}),
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Resend API error (${response.status}): ${text}`);
    }

    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: process.env.EMAIL_PORT == 465,
    tls: { servername: process.env.EMAIL_HOST },
    family: 4,
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  if (htmlBody) {
    message.html = htmlBody;
  }

  await transporter.sendMail(message);
};

module.exports = sendEmail;
