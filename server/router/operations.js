const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  adminlogin,
  resetpassword,
  verifyemail,
  userlogin,
  userregister,
  createCourse,
  getUserCourses,
} = require("../controllers/authentication");
const { userdash } = require("../controllers/dashboard");
const { admindashboard } = require("../controllers/adminDashBoard");
const { payments } = require("../controllers/paymentConfirmation");
const { initiatewithdraw } = require("../controllers/initiatewithdraw"); // Import the withdrawals function
const { withdrawals } = require("../controllers/withdrawals");
const { coursesales } = require("../controllers/sales");
const { commissionsales } = require("../controllers/commisionsales");
const {
  affiliatereferrals,
  generateaffiliatelink,
  affiliatesales,
  affiliatedlinks,
  affiliatesalesmetrics,
} = require("../controllers/affiliate");
const {
  registerAndPay,
  paymentcallback,
  courselogin,
} = require("../controllers/coursepayment");
const { checkTransactionStatusByEmail } = require("../controllers/transactionstatus");
const { logout } = require("../controllers/logout");
const { getTopAffiliate } = require("../controllers/affiliate"); // Import the getTopAffiliate function
const { uploadCourse, paymentCallback } = require("../controllers/courseManagement"); // Add the course management functions

const appRouter = express.Router();

// Authentication Routes
appRouter.route("/api/admin/login").post(protect, adminlogin);
appRouter.route("/api/user/login").post(userlogin);
appRouter.route("/api/register").post(userregister);
appRouter.route("/api/reset-password").post(resetpassword);
appRouter.route("/api/verify-email").post(verifyemail);

// Dashboard Routes
appRouter.route("/api/admindash").get(protect, admindashboard);
appRouter.route("/api/userdash").get(protect, userdash);

// Payment and Withdrawal Routes
appRouter.route("/api/payments").get(protect, payments);
appRouter.route("/api/initiatewithdraw").post(protect, initiatewithdraw); // Route for initiating a withdrawal
appRouter.route("/api/withdrawals").get(protect, withdrawals); // Route for fetching all withdrawals

// Affiliate Routes
appRouter.route("/api/affiliate/:courseId/:affiliateId").get(protect, affiliatereferrals);
appRouter.route("/api/generate-affiliate-link/:courseId").post(protect, generateaffiliatelink);
appRouter.route("/api/sale").post(protect, affiliatesales);
appRouter.route("/api/affiliate-links/:affiliateId").get(protect, affiliatedlinks);
appRouter.route("/api/affiliate-sales/:affiliateId").get(protect, affiliatesalesmetrics);

// Course Routes
appRouter.route("/api/realtimesales").get(coursesales);
appRouter.route("/api/course-login").post(courselogin);
appRouter.route("/api/create-course").post(protect, createCourse);
appRouter.route("/api/get-all-user-courses").get(protect, getUserCourses);

// Sales Routes
appRouter.route("/api/sales").post(protect, commissionsales);

// Course Payment Routes
appRouter.route("/api/register-and-pay").post(registerAndPay);
appRouter.route("/api/payment-callback").get(paymentcallback);

// Transaction Status Route
appRouter.route("/api/transaction-status/:email").get(protect, checkTransactionStatusByEmail);

// Top Affiliate Route
appRouter.route("/api/top-affiliate").get(protect, getTopAffiliate);

// Course Management Routes
appRouter.route("/api/upload-course").post(protect, uploadCourse); // Route for assigning courses or initializing certification payments
appRouter.route("/api/payment-callback").get(paymentCallback); // Route for handling payment callbacks

module.exports = appRouter;
