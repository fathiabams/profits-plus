const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    courses: [
        {
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            affiliateLink: String,
        },
    ],
    todaySales: Number,
    overallSales: Number,
    todayAffiliateEarnings: Number,
    overallAffiliateEarnings: Number,
    availableAffiliateEarnings: Number,
    withdrawalFee: Number,
});

module.exports = mongoose.model('Affiliate', affiliateSchema);