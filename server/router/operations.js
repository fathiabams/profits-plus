const { protect } = require("../middleware/authMiddleware");
const { userdash } = require("../controllers/dashboard");
const { admindashboard } = require("../controllers/adminDashBoard");
const { payments } = require("../controllers/paymentConfirmation");
const { withdrawal } = require("../controllers/withdrawal");
const realtimeSales = require("../controllers/realtimesales");
const {
  adminlogin,
  resetpassword,
  verifyemail,
  userlogin,
  userregister,
  createCourse,
  getUserCourses,
} = require("../controllers/authentication");

const express = require("express");
const {
  affiliatereferrals,
  generateaffiliatelink,
  affiliatesales,
  affiliatedlinks,
  affiliatesalesmetrics,
} = require("../controllers/affiliate");
const { coursesales } = require("../controllers/sales");
const { commissionsales } = require("../controllers/commisionsales");
const {
  registerAndPay,
  paymentcallback,
  courselogin,
} = require("../controllers/coursepayment");
const Router = express.Router();

Router.route("/admin/login").post(protect, adminlogin);
Router.route("/userlogin").post(userlogin);
Router.route("/register").post(userregister);
Router.route("/admindash").get(protect, admindashboard);
Router.route("/userdash").get(protect, userdash);
Router.route("/payments").get(payments);
Router.route("/withdrawals").post(protect, withdrawal);
Router.route("/api/affiliate/:courseId/:affiliateId").get(
  protect,
  affiliatereferrals
);
Router.route("/api/generate-affiliate-link/:courseId").post(
  protect,
  generateaffiliatelink
);
Router.route("/api/sale").post(protect, affiliatesales);
Router.route("/api/affiliate-links/:affiliateId").get(protect, affiliatedlinks);
Router.route("/api/affiliate-sales/:affiliateId").get(
  protect,
  affiliatesalesmetrics
);
Router.route("/api/realtimesales").get(coursesales);
Router.route("/sales").post(commissionsales);
Router.route("/reset-password").post(resetpassword);
Router.route("/verify-email").post(verifyemail);
Router.route("/register-and-pay").post(registerAndPay);
Router.route("/payment-callback").get(paymentcallback);
Router.route('/course-login').post(courselogin)
Router.route('/create-course').post(protect, createCourse)
Router.route('/get-all-user-courses').get(protect, getUserCourses)

module.exports = Router;
