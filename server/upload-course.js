const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { Course, Payment } = require('./models'); // Import your models

// Assign course or initialize payment for certification
const uploadCourse = async (req, res) => {
    const { email, sellerName, courseName, payForCertificate } = req.body;

    try {
        // Validate if course and seller name exist in the marketplace
        const course = await Course.findOne({ name: courseName, sellerName });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course or seller name not found. Ensure they match the marketplace.",
            });
        }

        // Check if the course has already been assigned
        if (course.ownerEmail) {
            return res.status(400).json({
                success: false,
                message: "This course has already been assigned to another user.",
            });
        }

        // Assign course to the user's email
        course.ownerEmail = email; // Assign the user's email as the owner
        await course.save();

        // If user opts to pay for certificate
        if (payForCertificate) {
            const amount = 1500000; // 15,000 in Kobo
            const reference = `REF-${Date.now()}`;
            const callbackUrl = "https://profitplusbackend.com.ng/api/v1/payment-callback";

            // Initialize payment
            const paymentData = await initializePayment(email, amount, reference, callbackUrl);

            // Save payment details
            const payment = new Payment({
                email,
                amount,
                reference,
                authorization_url: paymentData.authorization_url,
                status: "pending",
            });
            await payment.save();

            return res.json({
                success: true,
                authorizationUrl: paymentData.authorization_url,
                message: "Please complete your payment for the exam and certificate at the provided URL.",
            });
        }

        // If no payment is made, return success response
        return res.status(200).json({
            success: true,
            message: "Course assigned successfully without certificate and exam.",
        });
    } catch (error) {
        console.error("Error in uploading course:", error.message);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Payment callback logic
const paymentCallback = async (req, res) => {
    const { reference } = req.query;

    try {
        // Verify payment using Paystack
        const verifyPaymentResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        if (verifyPaymentResponse.data.status) {
            const paymentData = verifyPaymentResponse.data.data;

            if (paymentData.status === "success") {
                // Update payment status
                await Payment.updateOne({ reference }, { status: "successful" });

                // Send success email
                await sendSuccessEmail(paymentData.customer.email, paymentData);

                return res.redirect("https://www.theprofitplus.com.ng/frontend/success.html");
            } else {
                // Handle failed payment
                await Payment.updateOne({ reference }, { status: "failed" });
                return res.status(400).json({ success: false, message: "Payment failed" });
            }
        } else {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Send success email
const sendSuccessEmail = async (recipientEmail, paymentData) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: "Payment Successful - ProfitPlus",
        html: `
        <html>
        <body>
            <h2>Payment Successful!</h2>
            <p>Dear User,</p>
            <p>We have received your payment of <b>${paymentData.amount / 100} Naira</b>.</p>
            <p>Your transaction reference is <b>${paymentData.reference}</b>.</p>
            <p>You are now recognized as the owner of the course. Complete the course to earn a ProfitPlus certificate upon passing the assessment.</p>
            <p>Thank you for choosing ProfitPlus!</p>
        </body>
        </html>`,
    };

    await transporter.sendMail(mailOptions);
};

// Initialize payment using Paystack
const initializePayment = async (email, amount, reference, callbackUrl) => {
    const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
            email,
            amount,
            reference,
            callback_url: callbackUrl,
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data.data;
};

module.exports = { uploadCourse, paymentCallback };
