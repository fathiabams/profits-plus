const User = require('../model/user');
const Course = require('../model/course');
const Commission = require('../model/commission');

const commissionsales = async (req, res) => {
  const { userId, courseId, salesCount } = req.body;
  const user = await User.findById(userId);
  const course = await Course.findById(courseId);
  const commission = await Commission.findOne({ courseId });

  // Calculate commission
  const commissionAmount = salesCount * course.price * 0.4;

  // Update user's sales statistics
  user.todaySales += salesCount;
  user.overallSales += salesCount;
  user.todayEarnings += commissionAmount;
  user.overallEarnings += commissionAmount;

  // Update user's affiliate earnings (if applicable)
  if (user.affiliateId) {
    const affiliate = await User.findById(user.affiliateId);
    affiliate.todayAffiliateEarnings += commissionAmount;
    affiliate.overallAffiliateEarnings += commissionAmount;
    await affiliate.save();
  }

  // Update user's record
  await user.save();

  res.send('Sale recorded successfully!');
};


module.exports ={
    commissionsales
}
