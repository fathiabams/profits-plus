const mongoose = require('mongoose');

const initiateWithdrawSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // This references the User model
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const InitiateWithdraw = mongoose.model('InitiateWithdraw', initiateWithdrawSchema);

module.exports = InitiateWithdraw;
