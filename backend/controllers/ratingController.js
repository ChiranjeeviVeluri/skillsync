const Rating = require('../models/Rating');
const Booking = require('../models/Booking');

const submitRating = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const userId = req.user.id;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('tutor learner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify the booking is completed and the user is the learner
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed sessions'
      });
    }

    if (booking.learner._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the learner can rate this session'
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ booking: bookingId, rater: userId });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this session'
      });
    }

    // Create new rating
    const newRating = new Rating({
      booking: bookingId,
      rater: userId,
      tutor: booking.tutor._id,
      rating: rating,
      review: review?.trim() || '',
      subject: booking.subject
    });

    await newRating.save();

    // Populate the rating with user details for response
    const populatedRating = await Rating.findById(newRating._id)
      .populate('rater', 'firstName lastName')
      .populate('tutor', 'firstName lastName');

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: populatedRating
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getRatings = async (req, res) => {
  try {
    const { tutorId, limit = 10 } = req.query;

    let filter = {};
    if (tutorId) {
      filter.tutor = tutorId;
    }

    const ratings = await Rating.find(filter)
      .populate('rater', 'firstName lastName')
      .populate('tutor', 'firstName lastName')
      .populate('booking', 'subject createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: ratings.length,
      data: ratings
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getTutorRatingStats = async (req, res) => {
  try {
    const tutorId = req.params.tutorId;

    const ratings = await Rating.find({ tutor: tutorId });

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings) : 0;

    // Calculate rating distribution
    const distribution = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length
    };

    res.json({
      success: true,
      data: {
        totalRatings,
        averageRating: parseFloat(averageRating.toFixed(1)),
        distribution
      }
    });

  } catch (error) {
    console.error('Get tutor rating stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  submitRating,
  getRatings,
  getTutorRatingStats
};