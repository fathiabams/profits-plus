const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true)
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongodb connected:${conn.connection.host}`);
    } catch (error) {
        console.log(`this is an error ${error}`);
        process.exit(1);
    }
};
module.exports = connectDB;