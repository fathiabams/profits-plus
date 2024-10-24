const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  rate: { type: Number, default: 0.1 } // default commission rate (10%)
});

const Commission = mongoose.model('Commission', commissionSchema);
module.exports = Commission;
