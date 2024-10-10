const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: 'gmail',
  port: 587,
  secure: false, // or 'STARTTLS'
  auth: {
    user: process.env.email,
    password: process.env.password
  }
});

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: 'your-from-email',
    to,
    subject,
    html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = sendEmail