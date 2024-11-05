// controllers/paymentController.js
const initializePayment = require('./paystackservice');
const User = require('../model/courseschema');
const Payment = require('../model/Payment');

const registerAndPay = async (req, res) => {
    const { name, email, phone } = req.body;

    const reference = `REF-${Date.now()}`;
    const amount = 10000;  // Amount in kobo
    const callbackUrl = 'http://your-website.com/payment-success';

    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email, phone });
        }

        const paymentData = await initializePayment(email, amount, reference, callbackUrl);

        const payment = new Payment({
            userId: user._id,
            amount,
            reference,
            authorization_url: paymentData.authorization_url,
            status: 'pending'
        });
        await payment.save();

        res.json({
            success: true,
            authorizationUrl: paymentData.authorization_url,
            message: 'Please complete your payment at the following URL.'
        });
    } catch (error) {
        console.error('Payment initialization error:', error.message);
        res.status(500).json({ success: false, message: 'Payment initialization failed', error: error.message });
    }
};

module.exports = { registerAndPay };
