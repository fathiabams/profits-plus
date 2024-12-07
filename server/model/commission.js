const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  rate: { type: Number, default: 0.4 } // default commission rate (40%)
});

const Commission = mongoose.model('Commission', commissionSchema);
module.exports = Commission;
