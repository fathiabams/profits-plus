const axios = require("axios");
const Payment = require("../model/Payment");
const User = require("../model/courseschema");

const checkTransactionStatusByEmail = async (req, res) => {
    const { email } = req.params; // Extract email from request parameters

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find the most recent payment record for the user
        const payment = await Payment.findOne({ userId: user._id }).sort({ createdAt: -1 });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "No payment record found for this user",
            });
        }

        // Verify the payment status via Paystack API
        const verifyPaymentResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${payment.reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        if (verifyPaymentResponse.data.status) {
            const paymentData = verifyPaymentResponse.data.data;

            // Update the payment status in the database
            let statusMessage;
            if (paymentData.status === "success") {
                statusMessage = "Transaction was successful";
                await Payment.updateOne(
                    { reference: payment.reference },
                    { status: "successful" }
                );
            } else if (paymentData.status === "failed") {
                statusMessage = "Transaction was not successful";
                await Payment.updateOne(
                    { reference: payment.reference },
                    { status: "failed" }
                );
            } else if (paymentData.status === "abandoned") {
                statusMessage = "Transaction is pending";
                await Payment.updateOne(
                    { reference: payment.reference },
                    { status: "pending" }
                );
            } else {
                statusMessage = "Unknown transaction status";
            }

            return res.status(200).json({
                success: true,
                email,
                reference: payment.reference,
                status: paymentData.status,
                message: statusMessage,
                amount: paymentData.amount / 100, // Convert amount to original currency
                date: paymentData.transaction_date,
                paymentDetails: paymentData,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Failed to verify transaction status with Paystack",
            });
        }
    } catch (error) {
        console.error("Error checking transaction status:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

module.exports = {
    checkTransactionStatusByEmail,
};
