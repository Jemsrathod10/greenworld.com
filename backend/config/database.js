const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // ✅ ONLY CHANGE: Now using the link from your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Database: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;