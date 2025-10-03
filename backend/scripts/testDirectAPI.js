const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Rating = require('../models/Rating');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testDirectAPI = async () => {
  try {
    await connectDB();

    // Get Demo Tutor
    const tutor = await User.findOne({ email: 'tutor@university.edu' });
    console.log('Demo Tutor:', tutor.firstName, tutor.lastName, tutor._id);

    // Get tutor's booking statistics (same as API)
    const bookings = await Booking.find({ tutor: tutor._id });
    const completedSessions = bookings.filter(b => b.status === 'completed');
    console.log('Completed sessions:', completedSessions.length);

    // Get real ratings from Rating model (same as API)
    const ratings = await Rating.find({ tutor: tutor._id });
    console.log('Ratings in database:', ratings.length);
    console.log('Raw ratings data:', ratings);

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : '0.0';

    console.log('Final calculated rating:', averageRating);
    console.log('Review count:', totalRatings);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testDirectAPI();