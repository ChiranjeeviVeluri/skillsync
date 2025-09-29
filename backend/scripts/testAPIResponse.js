const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testAPIResponse = async () => {
  try {
    await connectDB();

    // Get a test user (learner)
    const learner = await User.findOne({ role: 'learner' });
    const tutor = await User.findOne({ role: 'tutor' });

    if (!learner) {
      console.log('❌ No learner found');
      process.exit(1);
    }

    console.log('🧑‍🎓 Testing for learner:', learner.email);

    // Simulate the backend API call - get bookings for learner
    const learnerFilter = { learner: learner._id };
    const learnerBookings = await Booking.find(learnerFilter)
      .populate('learner', 'firstName lastName email university school')
      .populate('tutor', 'firstName lastName email university school subjects')
      .sort({ date: 1, timeSlot: 1 });

    console.log('\n📚 Learner bookings (API format):');
    const learnerResponse = {
      success: true,
      count: learnerBookings.length,
      data: learnerBookings
    };
    console.log(`Count: ${learnerResponse.count}`);
    learnerResponse.data.forEach((booking, index) => {
      console.log(`  ${index + 1}. ${booking.subject} - Status: ${booking.status} - Date: ${booking.date.toDateString()}`);
    });

    if (tutor) {
      console.log('\n👨‍🏫 Testing for tutor:', tutor.email);

      // Simulate the backend API call - get bookings for tutor
      const tutorFilter = { tutor: tutor._id };
      const tutorBookings = await Booking.find(tutorFilter)
        .populate('learner', 'firstName lastName email university school')
        .populate('tutor', 'firstName lastName email university school subjects')
        .sort({ date: 1, timeSlot: 1 });

      console.log('\n📚 Tutor bookings (API format):');
      const tutorResponse = {
        success: true,
        count: tutorBookings.length,
        data: tutorBookings
      };
      console.log(`Count: ${tutorResponse.count}`);
      tutorResponse.data.forEach((booking, index) => {
        console.log(`  ${index + 1}. ${booking.subject} - Status: ${booking.status} - Date: ${booking.date.toDateString()}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAPIResponse();