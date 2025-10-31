import * as nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PSW,
      },
      logger: false,
      debug: false,
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      html: text,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else console.log(info);
    });
  } catch (e) {
    console.log(e);
  }
};
