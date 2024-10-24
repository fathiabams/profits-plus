const express = require('express');
const router = express.Router();
const Sale = require('../model/sales');
const User = require('../model/user');
const { authMiddleware } = require('../middleware/authMiddleware');
const userdash= async (req, res) => {
    const userId = req.userId;
    const user = await User.findById(userId);
    const sales = await Sale.find({ vendor: userId });
    const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);
    const totalCommissions = sales.reduce((acc, sale) => acc + sale.commission, 0);
    res.send({ user, sales, totalSales, totalCommissions });
};
module.exports = {userdash};