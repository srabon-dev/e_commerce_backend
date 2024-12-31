const nodemailer = require("nodemailer");

const currentDate = new Date();

const formattedDate = currentDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: parseInt(process.env.SMTP_PORT),
    // secure: true,
    auth: {
      user: process.env.smtp_mail,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, html } = options;

  const mailOptions = {
    from: `${process.env.SERVICE_NAME} <${process.env.smtp_mail}>`,
    to: email,
    date: formattedDate,
    signed_by: "daraz.com",
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };