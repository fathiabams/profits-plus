const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  todaySales: { type: Number, default: 0 },
  overallSales: { type: Number, default: 0 },
  todayEarnings: { type: Number, default: 0 },
  overallEarnings: { type: Number, default: 0 },
  todayAffiliateEarnings: { type: Number, default: 0 },
  overallAffiliateEarnings: { type: Number, default: 0 },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
