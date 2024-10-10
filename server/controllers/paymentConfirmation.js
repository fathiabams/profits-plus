const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Sale = require('../model/sales');
const nodemailer = require('nodemailer');

const payments = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send({ message: 'User not found' });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: user.email,
        subject: 'Payment Confirmation',
        text: `
      Hello ${user.name},
      
      Your payment has been confirmed.
      
      Email: ${user.email}
      Password: ${password}
      
      Best regards,
      [Your Name]
    `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.send({ message: 'Payment confirmed and email sent' });
};

module.exports = {
    payments
};
