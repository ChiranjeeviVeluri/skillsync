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

const testBookings = async () => {
  try {
    await connectDB();

    // Get some users
    const learner = await User.findOne({ role: 'learner' });
    const tutor = await User.findOne({ role: 'tutor' });

    if (!learner || !tutor) {
      console.log('❌ Need at least one learner and one tutor');
      process.exit(1);
    }

    console.log('📚 Found users:');
    console.log(`   Learner: ${learner.firstName} ${learner.lastName} (${learner.email})`);
    console.log(`   Tutor: ${tutor.firstName} ${tutor.lastName} (${tutor.email})`);

    // Create a test booking
    const testBooking = new Booking({
      learner: learner._id,
      tutor: tutor._id,
      subject: 'mathematics',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      timeSlot: '14:00',
      duration: 60,
      location: 'Online',
      message: 'Test booking for debugging',
      status: 'pending'
    });

    await testBooking.save();
    console.log('✅ Created test booking:', testBooking._id);

    // Now test accepting it
    testBooking.status = 'accepted';
    await testBooking.save();
    console.log('✅ Updated booking status to accepted');

    // Check all bookings and their statuses
    const allBookings = await Booking.find({})
      .populate('learner', 'firstName lastName email role')
      .populate('tutor', 'firstName lastName email role');

    console.log('\n📋 All Bookings:');
    allBookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.subject} - Status: ${booking.status}`);
      console.log(`      Learner: ${booking.learner.firstName} ${booking.learner.lastName}`);
      console.log(`      Tutor: ${booking.tutor.firstName} ${booking.tutor.lastName}`);
      console.log(`      Date: ${booking.date.toDateString()} at ${booking.timeSlot}`);
      console.log(`      ID: ${booking._id}`);
      console.log('');
    });

    // Group by status for debugging
    const statusCounts = {
      pending: allBookings.filter(b => b.status === 'pending').length,
      accepted: allBookings.filter(b => b.status === 'accepted').length,
      completed: allBookings.filter(b => b.status === 'completed').length,
      cancelled: allBookings.filter(b => b.status === 'cancelled').length,
      rejected: allBookings.filter(b => b.status === 'rejected').length
    };

    console.log('📊 Status Counts:', statusCounts);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testBookings();