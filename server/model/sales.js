const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    commission: Number,
    date: Date
},{
    timestamp:true
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;