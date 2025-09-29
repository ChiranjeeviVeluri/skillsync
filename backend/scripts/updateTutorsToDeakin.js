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

const updateTutorsToDeakin = async () => {
  try {
    await connectDB();

    // Define school mappings based on subjects
    const schoolMappings = {
      'sarah.johnson@university.edu': 'School of Engineering',
      'mike.chen@university.edu': 'School of Information Technology',
      'emma.davis@university.edu': 'School of Life and Environmental Sciences',
      'alex.rodriguez@university.edu': 'School of Communication and Creative Arts',
      'lisa.wang@university.edu': 'School of Engineering',
      'david.brown@university.edu': 'Deakin Business School',
      'maria.garcia@university.edu': 'School of Life and Environmental Sciences',
      'john.smith@university.edu': 'School of Communication and Creative Arts',
      'tutor@university.edu': 'School of Information Technology', // Original demo tutor
      'learner@university.edu': 'School of Business' // Update learner too
    };

    // Update all users to Deakin University
    let updateCount = 0;

    for (const [email, school] of Object.entries(schoolMappings)) {
      const result = await User.updateOne(
        { email: email },
        {
          university: 'Deakin University',
          school: school // We'll add this field to the display
        }
      );

      if (result.modifiedCount > 0) {
        updateCount++;
        console.log(`✅ Updated ${email} → ${school}`);
      }
    }

    console.log(`\n🎯 Updated ${updateCount} users to Deakin University`);
    console.log('All tutors now belong to Deakin University with appropriate schools!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating tutors:', error);
    process.exit(1);
  }
};

updateTutorsToDeakin();