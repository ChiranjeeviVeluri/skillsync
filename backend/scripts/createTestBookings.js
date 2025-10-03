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

const createTestBookings = async () => {
  try {
    await connectDB();

    // Get test users
    const learner = await User.findOne({ email: 'learner@university.edu' });
    const tutor = await User.findOne({ email: 'tutor@university.edu' });

    if (!learner || !tutor) {
      console.log('❌ Test users not found. Please run createTestUsers.js first.');
      process.exit(1);
    }

    console.log(`Found learner: ${learner.firstName} ${learner.lastName}`);
    console.log(`Found tutor: ${tutor.firstName} ${tutor.lastName}`);

    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing bookings');

    // Create test bookings with various statuses and dates
    const testBookings = [
      // Completed sessions (past)
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Mathematics',
        date: new Date('2024-01-15'),
        timeSlot: '10:00 AM',
        duration: 60,
        location: 'Library Study Room 1',
        status: 'completed',
        message: 'Need help with calculus derivatives'
      },
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Physics',
        date: new Date('2024-01-20'),
        timeSlot: '2:00 PM',
        duration: 90,
        location: 'Online',
        status: 'completed',
        message: 'Struggling with mechanics problems'
      },
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Computer Science',
        date: new Date('2024-01-25'),
        timeSlot: '4:00 PM',
        duration: 60,
        location: 'Computer Lab',
        status: 'completed',
        message: 'Need help with algorithms'
      },

      // Accepted upcoming sessions
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Mathematics',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        timeSlot: '11:00 AM',
        duration: 60,
        location: 'Library Study Room 2',
        status: 'accepted',
        message: 'Review for upcoming midterm exam'
      },
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Physics',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        timeSlot: '3:00 PM',
        duration: 75,
        location: 'Online',
        status: 'accepted',
        message: 'Thermodynamics concepts'
      },

      // Pending sessions
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Computer Science',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        timeSlot: '1:00 PM',
        duration: 90,
        location: 'Computer Lab',
        status: 'pending',
        message: 'Data structures and algorithms practice'
      },

      // Mix of recent activity
      {
        learner: learner._id,
        tutor: tutor._id,
        subject: 'Mathematics',
        date: new Date('2024-01-10'),
        timeSlot: '9:00 AM',
        duration: 60,
        location: 'Online',
        status: 'cancelled',
        message: 'Had to cancel due to illness'
      }
    ];

    // Adjust createdAt dates for realistic recent activity
    testBookings.forEach((booking, index) => {
      // Spread creation times over the last 2 weeks
      const daysAgo = Math.floor(Math.random() * 14);
      booking.createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    });

    const createdBookings = await Booking.insertMany(testBookings);
    console.log(`✅ Created ${createdBookings.length} test bookings:`);

    createdBookings.forEach(booking => {
      console.log(`   - ${booking.subject} (${booking.status}) on ${booking.date.toDateString()}`);
    });

    console.log('\n🎯 Test Dashboard Data Ready!');
    console.log('You can now test the dashboard with:');
    console.log('- Learner: learner@university.edu / password123');
    console.log('- Tutor: tutor@university.edu / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test bookings:', error);
    process.exit(1);
  }
};

createTestBookings();