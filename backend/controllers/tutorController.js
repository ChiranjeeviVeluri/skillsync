const User = require('../models/User');
const Booking = require('../models/Booking');

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

      // Calculate stats
      const totalSessions = completedSessions.length;
      const averageRating = totalSessions > 0 ?
        (4.0 + Math.random() * 1.0).toFixed(1) : '0.0'; // Mock rating for now

      // Calculate hourly rate (mock for now)
      const hourlyRate = 20 + Math.floor(Math.random() * 20); // $20-40/hour

      // Determine availability status (mock for now)
      const isAvailable = Math.random() > 0.3; // 70% chance of being available

      return {
        ...tutor.toObject(),
        stats: {
          totalSessions,
          averageRating: parseFloat(averageRating),
          hourlyRate,
          reviewCount: totalSessions,
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
      case 'price':
        filteredTutors.sort((a, b) => a.stats.hourlyRate - b.stats.hourlyRate);
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

    // Calculate detailed stats
    const totalSessions = completedSessions.length;
    const averageRating = totalSessions > 0 ?
      (4.0 + Math.random() * 1.0).toFixed(1) : '0.0';
    const hourlyRate = 20 + Math.floor(Math.random() * 20);
    const isAvailable = Math.random() > 0.3;

    // Get recent reviews (mock data for now)
    const recentReviews = completedSessions.slice(0, 5).map(booking => ({
      id: booking._id,
      studentName: `${booking.learner.firstName} ${booking.learner.lastName}`,
      rating: 4 + Math.random(),
      comment: `Great session on ${booking.subject}. Very helpful!`,
      date: booking.createdAt,
      subject: booking.subject
    }));

    // Get unique students count
    const uniqueStudents = [...new Set(completedSessions.map(b => b.learner._id.toString()))];

    const enhancedTutor = {
      ...tutor.toObject(),
      stats: {
        totalSessions,
        averageRating: parseFloat(averageRating),
        hourlyRate,
        reviewCount: totalSessions,
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