const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Sale = require('../model/sales');
const { authMiddleware } = require('../middleware/authMiddleware');

const withdrawal=  async (req, res) => {
    const { amount } = req.body;
    const userId = req.userId;
    const user = await User.findById(userId);
    if (user.commission < amount) {
        return res.status(400).send({ message: 'Insufficient commission' });
    }

    user.commission -= amount;
    await user.save();

    // Perform withdrawal operation

    res.send({ message: 'Withdrawal successful' });
};

module.exports = {withdrawal};