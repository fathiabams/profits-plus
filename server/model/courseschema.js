// models/User.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    courseid: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("userregisteredcourse", courseSchema);
