const mongoose = require("mongoose");

const connectDB = async () => {
  const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/";
  const dbName = process.env.MONGODB_DBNAME || "skillhub";
  try {
    const conn = await mongoose.connect(`${dbURI}${dbName}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process only if not in test environment
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    // Optional: If in test, maybe throw the error so tests can catch it if needed
    // else {
    //   throw error;
    // }
  }
};

module.exports = connectDB;
