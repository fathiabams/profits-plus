const initializePayment = require("./paystackservice");
const User = require("../model/user");
const Learner = require("../model/learner"); // Updated model name
const Payment = require("../model/Payment");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Register and pay (for learners)
const registerAndPay = async (req, res) => {
    const amount = 400000; // Payment amount in kobo
    const { name, email, phone, password, courseid } = req.body;
    const reference = `REF-${Date.now()}`;
    const callbackUrl = "https://profitplusbackend.com.ng/api/v1/payment-callback";

    try {
        let affiliateUser = await User.findOne({email})
        let user = await Learner.findOne({ email });
        if (user) {
            res.status(401).json({ message: "User already exists" });
            return
        }
        if(!affiliateUser){
            res.status(401).json(
                {message: "You must register as a user from our affiliate site before you can register for a course"}
            )
            return 
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await Learner.create({
            name,
            email,
            phone,
            password: hashedPassword,
            courseid,
        });

        const paymentData = await initializePayment(
            email,
            amount,
            reference,
            callbackUrl
        );

        const payment = new Payment({
            userId: user._id,
            amount,
            reference,
            authorization_url: paymentData.authorization_url,
            status: "pending",
        });
        await payment.save();

        res.json({
            success: true,
            authorizationUrl: paymentData.authorization_url,
            message: "Please complete your payment at the following URL.",
        });
    } catch (error) {
        console.error("Payment initialization error:", error.message);
        res.status(500).json({
            success: false,
            message: "Payment initialization failed",
            error: error.message,
        });
    }
};

// Payment callback
const paymentcallback = async (req, res) => {
    const { reference } = req.query;

    try {
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
                await Payment.updateOne({ reference }, { status: "successful" });
                await sendSuccessEmail(paymentData.customer.email, paymentData);
                return res.redirect("https://www.theprofitplus.com.ng/frontend/super/success.html");
            } else {
                await Payment.updateOne({ reference }, { status: "failed" });
                return res.status(400).json({
                    success: false,
                    message: "Payment was not successful.",
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed.",
            });
        }
    } catch (error) {
        console.error("Payment verification error:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
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
        subject: "Payment Successful!",
        html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Payment Successful!</h2>
            <p>Your payment of <strong>${paymentData.amount / 100}</strong> was successful.</p>
            <p>Transaction Reference: <strong>${paymentData.reference}</strong></p>
            <p>Thank you for your payment!</p>
        </div>`,
    };

    await transporter.sendMail(mailOptions);
};

// Learner login
const courselogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Learner.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        res.cookie("token", token);
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    registerAndPay,
    paymentcallback,
    courselogin,
};
