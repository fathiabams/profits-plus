const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Admin = require('../model/admin');

// User Registration
const userregister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        const newsuer = await user.save();
        if (newsuer) {
            const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token);
            res.status(200).json({ ...user._doc });
        } else {
            res.status(403).send({ message: `Registration failed` });
        }
    } catch (error) {
        console.log(error)
    }
};

// User Login
const userlogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).send({ message: 'Invalid email or password' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.cookie('token', token);
    res.status(200).json({ ...user._doc });
};

// Admin Login
const adminlogin = async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
        return res.status(401).send({ message: 'Invalid username or password' });
    }
    const token = jwt.sign({ adminId: admin._id }, process.env.SECRET_KEY, { expiresIn: '1h' });
    res.cookie('adminToken', token);
    res.send({ message: 'Logged in successfully' });
};




const resetpassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('User not found!');
  user.password = password;
  await user.save();

  const emailHtml = `
    <h1>Reset Your Password</h1>
    <p>New Password: ${newPassword}</p>
  `;

  sendEmail(email, 'Reset Your Password', emailHtml);

  res.send('Password reset successfully!');
};



const verifyemail= async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send('User not found!');

  const verificationLink = `http://example.com/verify-email/${user._id}`;
  const emailHtml = `
    <h1>Verify Your Email Address</h1>
    <p>Click the link below to verify your email address:</p>
    <p><a href="${verificationLink}">Verify Email</a></p>
  `;

  sendEmail(email, 'Verify Your Email Address', emailHtml);

  res.send('Email verification link sent successfully!');
};

module.exports = {
    adminlogin,
    userlogin,
    userregister,
    resetpassword,
    verifyemail
}