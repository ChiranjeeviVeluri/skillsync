const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
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

const createTestUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create test users - all at Deakin University
    const testUsers = [
      {
        firstName: 'Demo',
        lastName: 'Learner',
        email: 'learner@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Business',
        year: '2',
        role: 'learner',
        subjects: []
      },
      {
        firstName: 'Demo',
        lastName: 'Tutor',
        email: 'tutor@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Information Technology',
        year: '4',
        role: 'tutor',
        subjects: ['mathematics', 'physics', 'computer-science']
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Engineering',
        year: '3',
        role: 'learner',
        subjects: []
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Life and Environmental Sciences',
        year: 'graduate',
        role: 'tutor',
        subjects: ['chemistry', 'biology', 'english']
      }
    ];

    const createdUsers = await User.insertMany(testUsers);
    console.log(`✅ Created ${createdUsers.length} test users:`);

    createdUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎯 Test Credentials:');
    console.log('Learner: learner@university.edu / password123');
    console.log('Tutor: tutor@university.edu / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();