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
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleReviews = [
  "Excellent tutor! Very patient and explained concepts clearly.",
  "Great session, helped me understand the material much better.",
  "Very knowledgeable and friendly. Would definitely book again.",
  "Good session, though could have been more interactive.",
  "Outstanding teaching skills. Made difficult topics easy to understand.",
  "Professional and well-prepared. Highly recommend!",
  "Helpful session, got answers to all my questions.",
  "Amazing tutor! Very encouraging and supportive.",
  "Good explanation of concepts. Session was worth it.",
  "Fantastic! Made learning enjoyable and engaging."
];

const seedRatings = async () => {
  try {
    await connectDB();

    // Get all completed bookings
    const completedBookings = await Booking.find({ status: 'completed' })
      .populate('learner tutor');

    if (completedBookings.length === 0) {
      console.log('❌ No completed bookings found. Create some completed bookings first.');
      process.exit(1);
    }

    console.log(`📚 Found ${completedBookings.length} completed bookings`);

    // Clear existing ratings
    await Rating.deleteMany({});
    console.log('🗑️  Cleared existing ratings');

    let ratingsCreated = 0;

    for (const booking of completedBookings) {
      try {
        // Random chance of having a rating (80% chance)
        if (Math.random() > 0.2) {
          const rating = new Rating({
            booking: booking._id,
            rater: booking.learner._id,
            tutor: booking.tutor._id,
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars mostly
            review: sampleReviews[Math.floor(Math.random() * sampleReviews.length)],
            subject: booking.subject
          });

          await rating.save();
          ratingsCreated++;

          console.log(`✅ Created rating: ${rating.rating}⭐ for ${booking.subject} session`);
        }
      } catch (error) {
        console.log(`⚠️  Skipped rating for booking ${booking._id}: ${error.message}`);
      }
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`📊 Created ${ratingsCreated} ratings from ${completedBookings.length} completed bookings`);

    // Show rating statistics
    const tutors = await User.find({ role: 'tutor' });

    console.log('\n📈 Rating Statistics:');
    for (const tutor of tutors) {
      const ratings = await Rating.find({ tutor: tutor._id });
      if (ratings.length > 0) {
        const avgRating = (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1);
        console.log(`   ${tutor.firstName} ${tutor.lastName}: ${avgRating}⭐ (${ratings.length} reviews)`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding ratings:', error);
    process.exit(1);
  }
};

seedRatings();