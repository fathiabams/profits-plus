const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Admin = require("../model/admin");

// User Registration
const userregister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
  
    // Check if any required fields are missing
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    // Check if the user is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered. Please log in." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, email, password: hashedPassword });
    const newUser = await user.save();

    // If the user was successfully created, generate a token and send the response
    if (newUser) {
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res.cookie("token", token);
      res.status(200).json({ ...user._doc });
    } else {
      // If the user couldn't be saved, send an error
      res.status(403).json({ message: "Registration failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};


// User Login
const userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    res.status(200).json({ ...user._doc });
  } catch (error) {
    res.status(401).json({ message: error });
    console.error(`error ${error}`)
  }
};


const adminlogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    return res.status(401).send({ message: "Invalid username or password" });
  }
  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    return res.status(401).send({ message: "Invalid username or password" });
  }
  const token = jwt.sign({ adminId: admin._id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  res.cookie("adminToken", token);
  res.send({ message: "Logged in successfully" });
};

const resetpassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send("User not found!");
  user.password = password;
  await user.save();

  const emailHtml = `
    <h1>Reset Your Password</h1>
    <p>New Password: ${newPassword}</p>
  `;

  sendEmail(email, "Reset Your Password", emailHtml);

  res.send("Password reset successfully!");
};

const verifyemail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).send("User not found!");

  const verificationLink = `http://example.com/verify-email/${user._id}`;
  const emailHtml = `
    <h1>Verify Your Email Address</h1>
    <p>Click the link below to verify your email address:</p>
    <p><a href="${verificationLink}">Verify Email</a></p>
  `;

  sendEmail(email, "Verify Your Email Address", emailHtml);

  res.send("Email verification link sent successfully!");
};

module.exports = {
  adminlogin,
  userlogin,
  userregister,
  resetpassword,
  verifyemail,
};
