const User = require('../model/user');
const Course = require('../model/course');
const sendEmail = require('./email');

const coursesales = async (req, res) => {
    const { userId, courseId, salesCount } = req.body;

    const user = await User.findById(userId);
    const course = await Course.findById(courseId);

    const emailHtml = `
    <h1>Congratulations on Your Sales!</h1>
    <p>You've successfully made ${salesCount} sales!</p>
    <p>Course Title: ${course.title}</p>
    <p>Total Earnings: ${salesCount * commissionAmount}</p>
  `;

    sendEmail(user.email, 'Congratulations on Your Sales!', emailHtml);

    res.send('Email sent successfully!');
};

module.exports = {
    coursesales
}
