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

const createMoreTutors = async () => {
  try {
    await connectDB();

    // Create additional tutors for testing - all at Deakin University
    const additionalTutors = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Engineering',
        year: '3',
        role: 'tutor',
        subjects: ['mathematics', 'physics']
      },
      {
        firstName: 'Mike',
        lastName: 'Chen',
        email: 'mike.chen@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Information Technology',
        year: 'graduate',
        role: 'tutor',
        subjects: ['computer-science', 'mathematics']
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Life and Environmental Sciences',
        year: '4',
        role: 'tutor',
        subjects: ['chemistry', 'biology']
      },
      {
        firstName: 'Alex',
        lastName: 'Rodriguez',
        email: 'alex.rodriguez@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Communication and Creative Arts',
        year: '2',
        role: 'tutor',
        subjects: ['english', 'literature']
      },
      {
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa.wang@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Engineering',
        year: 'graduate',
        role: 'tutor',
        subjects: ['physics', 'mathematics', 'computer-science']
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'Deakin Business School',
        year: '3',
        role: 'tutor',
        subjects: ['economics', 'mathematics']
      },
      {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Life and Environmental Sciences',
        year: '4',
        role: 'tutor',
        subjects: ['chemistry', 'biology', 'physics']
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@university.edu',
        password: await bcrypt.hash('password123', 12),
        university: 'Deakin University',
        school: 'School of Communication and Creative Arts',
        year: '1',
        role: 'tutor',
        subjects: ['english', 'mathematics']
      }
    ];

    // Remove existing additional tutors (keep original demo ones)
    await User.deleteMany({
      email: { $in: additionalTutors.map(t => t.email) }
    });

    const createdTutors = await User.insertMany(additionalTutors);
    console.log(`✅ Created ${createdTutors.length} additional tutors:`);

    createdTutors.forEach(tutor => {
      console.log(`   - ${tutor.firstName} ${tutor.lastName} (${tutor.subjects.join(', ')})`);
    });

    console.log('\n🎯 Additional Tutor Data Ready!');
    console.log('You now have multiple tutors to test search and filtering with!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating additional tutors:', error);
    process.exit(1);
  }
};

createMoreTutors();