const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
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

const clearRatings = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing all ratings...');
    const result = await Rating.deleteMany({});

    console.log(`✅ Cleared ${result.deletedCount} ratings from database`);
    console.log('📊 Rating system reset - all tutors now show 0.0 rating until real ratings are submitted');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing ratings:', error);
    process.exit(1);
  }
};

clearRatings();