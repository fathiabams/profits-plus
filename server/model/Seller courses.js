const mongoose = require("mongoose");

const affiliateSchema = new mongoose.Schema({
  affiliateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true, // A unique identifier for each affiliate
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // References the user promoting the course
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true, // References the course being promoted
  },
  sales: {
    type: Number,
    default: 0, // Number of successful purchases tracked through the affiliate
  },
  revenueGenerated: {
    type: Number,
    default: 0, // Total revenue generated by the affiliate's sales
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Affiliate = mongoose.model("Affiliate", affiliateSchema);

module.exports = Affiliate;
