// config/db.js
const mongoose = require("mongoose");

// Singleton state — module-level variable
// Node's module cache ensures this is never re-initialized
let connection = null;

const connectDB = async () => {
  // Singleton check — reuse existing connection if it exists
  if (connection) {
    console.log("Using existing MongoDB connection");
    return connection;
  }

  try {
    connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Expose connection state for other modules if needed
const getConnection = () => connection;

module.exports = { connectDB, getConnection };