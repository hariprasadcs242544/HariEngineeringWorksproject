const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hari_engineering_db';
    console.log(`[Database] Connecting to MongoDB at: ${connStr.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
    
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });

    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Warning] Running in fallback mode. Database operations will attempt auto-reconnect or fail gracefully.`);
    return null;
  }
};

module.exports = connectDB;
