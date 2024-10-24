const Sale = require('../model/sales');
const User = require('../model/user');
const Admin = require('../model/admin');
const { adminAuthMiddleware } = require('../middleware/authMiddleware');

const admindashboard =  async (req, res) => {
    const adminId = req.adminId;
    const admin = await Admin.findById(adminId);
    const users = await User.find();
    const sales = await Sale.find();
    const totalSales = sales.reduce((acc, sale) => acc + sale.amount, 0);
    const totalCommissions = sales.reduce((acc, sale) => acc + sale.commission, 0);
    res.send({ admin, users, sales, totalSales, totalCommissions });
};

module.exports = {
    admindashboard
};
