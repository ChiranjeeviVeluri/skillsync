require('dotenv').config();
const connectDB = require('./config/database');

const testConnection = async () => {
  console.log('🔄 Testing database connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI);
  
  try {
    await connectDB();
    console.log('✅ Database connection test successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(1);
  }
};

testConnection();