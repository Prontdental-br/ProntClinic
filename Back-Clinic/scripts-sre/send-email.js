// send-email.js
const nodemailer = require('nodemailer');

const recipientEmail = process.env.RECIPIENT_EMAIL;
const subject = process.env.EMAIL_SUBJECT;
const body = process.env.EMAIL_BODY;

async function sendEmail() {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST_DEV,
    port: process.env.SMTP_PORT_DEV,
    secure: true,
    auth: {
      user: process.env.SMTP_USER_DEV,
      pass: process.env.SMTP_PASSWORD_DEV,
    },
  });

  let mailOptions = {
    from: '"GitHub Actions Bot" <no-reply@prontdental.cloud>',
    to: recipientEmail,
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    process.exit(1);
  }
}

sendEmail();
