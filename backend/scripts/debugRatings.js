const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Rating = require('../models/Rating');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugRatings = async () => {
  try {
    await connectDB();

    // Check Demo Tutor specifically
    const demoTutor = await User.findOne({ email: 'tutor@university.edu' });
    console.log('Demo Tutor ID:', demoTutor._id);

    // Check ratings for Demo Tutor
    const ratings = await Rating.find({ tutor: demoTutor._id });
    console.log('Ratings found for Demo Tutor:', ratings.length);

    if (ratings.length > 0) {
      console.log('Rating details:', ratings);

      // Delete these ratings
      const deleteResult = await Rating.deleteMany({ tutor: demoTutor._id });
      console.log('Deleted ratings:', deleteResult.deletedCount);
    }

    // Check all ratings in database
    const allRatings = await Rating.find({});
    console.log('Total ratings in database:', allRatings.length);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error debugging ratings:', error);
    process.exit(1);
  }
};

debugRatings();