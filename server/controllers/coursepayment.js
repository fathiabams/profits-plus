// controllers/paymentController.js
const initializePayment = require("./paystackservice");
const User = require("../model/courseschema");
const Payment = require("../model/Payment");
const bcrypt = require("bcryptjs");
const axios = require('axios');
const nodemailer = require('nodemailer')
const jwt = require("jsonwebtoken")
const courseuser= require('../model/courseschema.js')
const registerAndPay = async (req, res) => {
    const { name, email, phone, password, courseid ,amount} = req.body;
    console.log(name);

    const reference = `REF-${Date.now()}`;
  
    const callbackUrl = "https://profitplusbackend.com.ng/api/v1/payment-callback";

    try {
        let user = await User.findOne({ email });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await courseuser.create({
                name,
                email,
                phone,
                password: hashedPassword,
                courseid
            });
        } else {
            res.status(401).json({ message: "User Exist" });
        }
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
        res
            .status(500)
            .json({
                success: false,
                message: "Payment initialization failed",
                error: error.message,
            });
    }
};

const paymentcallback = async (req, res) => {
    const { reference, trxref } = req.query;

    try {
        // Verify the payment with Paystack using the transaction reference
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

            // Check payment status
            if (paymentData.status === "success") {
                await Payment.updateOne({ reference }, { status: "successful" });
                console.log(paymentData.customer.email)
                await sendSuccessEmail(paymentData.customer.email, paymentData);

                await Payment.updateOne({ reference }, { status: "sucessful" });;

                return res.redirect("https://www.theprofitplus.com.ng/frontend/super/sucess.html"); // Adjust the redirect URL as needed
            } else {
                await Payment.updateOne({ reference }, { status: "failed" });

                await deleteUser(paymentData.email); 
                return res.status(400).json({
                    success: false,
                    message: "Payment was not successful. User deleted.",
                });
            }
        } else {
            return res
                .status(400)
                .json({ success: false, message: "Payment verification failed." });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        return res
            .status(500)
            .json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
    }
};

const sendSuccessEmail = async (recipientEmail, paymentData) => {

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'Gmail'
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    console.log(recipientEmail)
    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: recipientEmail, // list of receivers
        subject: "Payment Successful!", // Subject line
        html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Successful</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 20px;
                    }

                    .container {
                        max-width: 600px;
                        margin: auto;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }

                    .header {
                        background: #28a745;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                    }

                    .header h1 {
                        margin: 0;
                    }

                    .content {
                        padding: 20px;
                        line-height: 1.6;
                    }

                    .footer {
                        background: #f4f4f4;
                        text-align: center;
                        padding: 10px;
                        font-size: 0.9em;
                    }

                    .footer p {
                        margin: 5px 0;
                    }

                    .highlight {
                        color: #28a745; /* Success color */
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Successful!</h1>
                    </div>
                    <div class="content">
                        <p>Dear User,</p>
                        <p>Your payment of <span class="highlight">${paymentData.amount/100}</span> was successful!</p>
                        <p>Transaction Reference: <span class="highlight">${paymentData.reference}</span></p>
                        <p>Thank you for your payment!</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,</p>
                        <p>Your Company Name</p>
                    </div>
                </div>
            </body>
            </html>`,
    };


    await transporter.sendMail(mailOptions);
};


const courselogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await courseuser.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: "Invalid email or password" });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: "Invalid email or password" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });
        res.cookie("token", token);
        res.status(200).json({ ...user._doc });
    } catch (error) {
        res.status(401).json({ message: error });
        console.error(`error ${error}`);
    }
};

module.exports = {
    registerAndPay,
    paymentcallback,
    courselogin
};
