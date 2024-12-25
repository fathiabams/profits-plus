const express = require('express');
const router = express.Router();
const User = require('../model/user');
const Withdrawal = require('../model/withdrawal');
const { authMiddleware } = require('../middleware/authMiddleware');

// Withdrawal operation
const withdrawal = async (req, res) => {
    const { amount, bankName, accountNumber } = req.body;  // Expecting bank details in the request body
    const userId = req.userId;  // This comes from authMiddleware

    // Ensure the user is authenticated
    if (!userId) {
        return res.status(401).send({ message: 'User not authenticated' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Check if the user has enough commission for the withdrawal
        if (user.commission < amount) {
            return res.status(400).send({ message: 'Insufficient commission' });
        }

        // Deduct the withdrawal amount from the user's commission
        user.commission -= amount;
        await user.save();

        // Create a new withdrawal record
        const newWithdrawal = new Withdrawal({
            userId,
            amount,
            bankName,
            accountNumber,
            status: 'Pending',  // Can be set to Pending initially, and changed later by an admin
            date: new Date(),
        });

        await newWithdrawal.save();

        // Send response back to the client
        res.send({ message: 'Withdrawal successful', withdrawal: newWithdrawal });
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        res.status(500).send({ message: 'Error processing withdrawal' });
    }
};

// Set up the route and middleware
router.post('/withdrawal', authMiddleware, withdrawal);

module.exports = router;
