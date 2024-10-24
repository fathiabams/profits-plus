const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: String,
    description: String,
    affiliates: [
        {
            affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' },
            affiliateLink: String,
        },
    ],
    sales: Number,
    benefits:String
});

module.exports = mongoose.model('Course', courseSchema);