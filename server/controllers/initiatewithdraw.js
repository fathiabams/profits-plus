const express = require('express');
const router = express.Router();
const User = require('../model/user');
const InitiateWithdraw = require('../model/initiatewithdraw'); // Updated model import
const { authMiddleware } = require('../middleware/authMiddleware');

// Initiate Withdraw operation
const initiateWithdraw = async (req, res) => {
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

        // Check if the user has enough commission for the withdraw
        if (user.commission < amount) {
            return res.status(400).send({ message: 'Insufficient commission' });
        }

        // Deduct the withdraw amount from the user's commission
        user.commission -= amount;
        await user.save();

        // Create a new initiate withdraw record
        const newInitiateWithdraw = new InitiateWithdraw({
            userId,
            amount,
            bankName,
            accountNumber,
            status: 'Pending',  // Can be set to Pending initially, and changed later by an admin
            date: new Date(),
        });

        await newInitiateWithdraw.save();

        // Send response back to the client
        res.send({ message: 'Initiate Withdraw successful', initiateWithdraw: newInitiateWithdraw });
    } catch (error) {
        console.error('Error processing initiate withdraw:', error);
        res.status(500).send({ message: 'Error processing initiate withdraw' });
    }
};

// Set up the route and middleware
router.post('/initiatewithdraw', authMiddleware, initiateWithdraw);

module.exports = router;
