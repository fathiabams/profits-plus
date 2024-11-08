const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    affiliate: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' },
    referredUser: String,
});

module.exports = mongoose.model('Referral', referralSchema);