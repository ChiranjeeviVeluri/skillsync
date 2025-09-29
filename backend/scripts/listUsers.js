const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const listUsers = async () => {
  try {
    await connectDB();

    const users = await User.find({}).select('firstName lastName email role');

    console.log('👥 All Users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n🔑 Login credentials for testing:');
    console.log('Learner: learner@university.edu / password123');
    console.log('Tutor: tutor@university.edu / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

listUsers();