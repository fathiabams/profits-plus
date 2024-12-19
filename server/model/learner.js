const mongoose = require('mongoose');
const Course = require('./course');

// A learner refers to a course platform user
const learnerSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course', 
    },
  ],
  isRegisteredUser: { type: Boolean, default: false },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
});

const Learner = mongoose.model('Learner', learnerSchema);
module.exports = Learner;
