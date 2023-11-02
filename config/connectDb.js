require("dotenv").config();
const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("Connected to the database!");
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = connectDb;