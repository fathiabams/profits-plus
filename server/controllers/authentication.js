const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Admin = require("../model/admin");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const { generateToken } = require("../utils/generateToken");
const Course = require("../model/course");

// const userregister = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res.status(400).json({ message: "Please fill all required fields." });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: "User already registered. Please log in." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({ username, email, password: hashedPassword });
//     const newUser = await user.save();

//     if (newUser) {
//       const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
//         expiresIn: "1h",
//       });
//       res.cookie("token", token);
//       res.status(200).json({ ...user._doc });
//     } else {
//       res.status(403).json({ message: "Registration failed" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "An error occurred. Please try again later." });
//   }
// };

const userregister = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }
    console.log(username, email, password);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, email, password: hashedPassword });
    const newUser = await user.save();

    if (newUser) {
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true, secure: true });
      res
        .header("Authorization", `Bearer ${token}`)
        .status(200)
        .json({ ...user._doc, password: undefined });

      await sendWelcomeEmail(email, username);
    } else {
      res.status(403).json({ message: "Registration failed" });
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});

const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to PROFIT PLUS",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to [Affiliate Website]</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    h1 {
      color: #333333;
    }
    p {
      color: #555555;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0066cc;
      color: #ffffff;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .cta-button:hover {
      background-color: #004c99;
    }
    .footer {
      font-size: 0.9em;
      color: #888888;
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to PROFIT PLUS!</h1>
    <p>Hi ${username},</p>
    <p>We’re thrilled to have you join us! As a new affiliate with https://fathiabams-task.vercel.app/, you’re now part of a community dedicated to success and growth. We're here to support you in maximizing your earnings and achieving your goals.</p>
    <p>Start exploring our platform and discover the tools and resources available to help you get the most out of your affiliate journey.</p>
    <a href="https://fathiabams-task.vercel.app/" class="cta-button">Get Started Now</a>
    <p>If you have any questions or need assistance, our support team is just an email away. We look forward to working with you!</p>
    <p>Welcome aboard, and here’s to your success!</p>
    <p>Best regards,<br>The profit plus Team</p>
    <div class="footer">
      © [Year] profit plus. All rights reserved.<br>
      <a href="https://fathiabams-task.vercel.app/" style="color: #0066cc;">Privacy Policy</a> | <a href="https://fathiabams-task.vercel.app/" style="color: #0066cc;">Terms of Service</a>
    </div>
  </div>
</body>
</html>
`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

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
    res
      .header("Authorization", `Bearer ${token}`)
      .status(200)
      .json({ ...user._doc });
  } catch (error) {
    res.status(401).json({ message: error });
    console.error(`error ${error}`);
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

const createCourse = asyncHandler(async (req, res) => {
  try {
    const { title, description, price, lessons } = req.body;
    const userId = req.auth;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = new Course({
      title,
      description,
      price,
      instructor: user._id,
      lessons,
    });

    const newCourse = await course.save();

    if (newCourse) {
      res.status(201).json({
        message: "Course registered successfully",
        course: newCourse,
      });
    } else {
      res.status(400).json({ message: "Failed to create course" });
    }
  } catch (error) {
    console.error("Error creating course:", error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});


const getUserCourses = asyncHandler(async (req, res) => {
  try {
    const userId = req.auth;
    const courses = await Course.find({ instructor: userId });

    if (courses.length > 0) {
      res.status(200).json(courses);
    } else {
      res.status(404).json({ message: "No courses found for this user" });
    }
  } catch (error) {
    console.error("Error fetching user's courses:", error);
    res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  }
});

module.exports = { getUserCourses };


module.exports = {
  adminlogin,
  userlogin,
  userregister,
  resetpassword,
  verifyemail,
  createCourse,
  getUserCourses
};
