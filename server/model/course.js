// models/Course.js

const mongoose = require("mongoose");

const course = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lessons: [
        {
            title: { type: String, required: true },
            content: { type: String, required: true },
        },
    ],
});

module.exports = mongoose.model("Course", course);
