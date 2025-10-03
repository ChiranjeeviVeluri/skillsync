const User = require('../models/User');
const Booking = require('../models/Booking');
const Rating = require('../models/Rating');

const getTutors = async (req, res) => {
  try {
    const {
      subject,
      availability,
      search,
      minRating,
      sortBy = 'rating',
      page = 1,
      limit = 20
    } = req.query;

    let filter = { role: 'tutor' };

    // Subject filtering
    if (subject) {
      filter.subjects = { $in: [subject] };
    }

    // Search functionality (name or subjects)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { subjects: { $in: [searchRegex] } },
        { university: searchRegex }
      ];
    }

    // Get basic tutors
    let tutorQuery = User.find(filter).select('-password');

    // Apply pagination
    const skip = (page - 1) * limit;
    tutorQuery = tutorQuery.skip(skip).limit(parseInt(limit));

    const tutors = await tutorQuery;

    // Enhance tutors with stats and ratings
    const enhancedTutors = await Promise.all(tutors.map(async (tutor) => {
      // Get tutor's booking statistics
      const bookings = await Booking.find({ tutor: tutor._id });
      const completedSessions = bookings.filter(b => b.status === 'completed');

      // Get real ratings from Rating model (only show actual captured ratings)
      const ratings = await Rating.find({ tutor: tutor._id });
      const totalRatings = ratings.length;
      const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : '0.0';

      // Calculate stats
      const totalSessions = completedSessions.length;

      // Simple availability (not random) - available by default
      const isAvailable = true;

      return {
        ...tutor.toObject(),
        stats: {
          totalSessions,
          averageRating: parseFloat(averageRating),
          reviewCount: totalRatings,
          isAvailable,
          availabilityText: isAvailable ? 'Available Now' : 'Busy Until Later'
        }
      };
    }));

    // Apply rating filter
    let filteredTutors = enhancedTutors;
    if (minRating) {
      filteredTutors = enhancedTutors.filter(t => t.stats.averageRating >= parseFloat(minRating));
    }

    // Apply availability filter
    if (availability === 'available') {
      filteredTutors = filteredTutors.filter(t => t.stats.isAvailable);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredTutors.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
        break;
      case 'reviews':
        filteredTutors.sort((a, b) => b.stats.reviewCount - a.stats.reviewCount);
        break;
      case 'availability':
        filteredTutors.sort((a, b) => b.stats.isAvailable - a.stats.isAvailable);
        break;
      case 'experience':
        filteredTutors.sort((a, b) => b.stats.totalSessions - a.stats.totalSessions);
        break;
      default:
        filteredTutors.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
    }

    // Get total count for pagination
    const totalTutors = await User.countDocuments(filter);

    res.json({
      success: true,
      count: filteredTutors.length,
      totalCount: totalTutors,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalTutors / limit),
      data: filteredTutors
    });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getTutorById = async (req, res) => {
  try {
    const tutor = await User.findById(req.params.id).select('-password');

    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    // Get tutor's detailed statistics
    const bookings = await Booking.find({ tutor: tutor._id }).populate('learner', 'firstName lastName');
    const completedSessions = bookings.filter(b => b.status === 'completed');

    // Get real ratings and reviews
    const ratings = await Rating.find({ tutor: tutor._id })
      .populate('rater', 'firstName lastName')
      .populate('booking', 'subject createdAt')
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : '0.0';

    // Simple availability (not based on random or complex logic)
    const isAvailable = true;

    // Get recent reviews from actual ratings
    const recentReviews = ratings.slice(0, 5).map(rating => ({
      id: rating._id,
      studentName: `${rating.rater.firstName} ${rating.rater.lastName}`,
      rating: rating.rating,
      comment: rating.review || 'Great session!',
      date: rating.createdAt,
      subject: rating.subject
    }));

    // Get unique students count
    const uniqueStudents = [...new Set(completedSessions.map(b => b.learner._id.toString()))];

    const enhancedTutor = {
      ...tutor.toObject(),
      stats: {
        totalSessions,
        averageRating: parseFloat(averageRating),
        reviewCount: totalRatings,
        uniqueStudents: uniqueStudents.length,
        isAvailable,
        availabilityText: isAvailable ? 'Available Now' : 'Busy Until Later',
        recentReviews
      }
    };

    res.json({
      success: true,
      data: enhancedTutor
    });
  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const updateTutorProfile = async (req, res) => {
  try {
    const { subjects, availability, bio } = req.body;
    
    const tutor = await User.findById(req.user.id);
    
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    if (subjects) tutor.subjects = subjects;
    if (availability) tutor.availability = availability;
    if (bio) tutor.bio = bio;
    
    await tutor.save();
    
    res.json({
      success: true,
      data: tutor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const createTutor = async (req, res) => {
  try {
    const { name, email, password, subjects, availability, bio } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    const tutor = new User({
      name,
      email,
      password,
      role: 'tutor',
      subjects,
      availability,
      bio
    });
    
    await tutor.save();
    
    const tutorResponse = await User.findById(tutor._id).select('-password');
    
    res.status(201).json({
      success: true,
      message: 'Tutor created successfully',
      data: tutorResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createTutor,
  getTutors,
  getTutorById,
  updateTutorProfile
};