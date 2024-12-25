// models/withdrawal.js
const mongoose = require('mongoose');

// Define the withdrawal schema
const withdrawalSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    date: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming you have a User collection
});

// Create the Withdrawal model
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
