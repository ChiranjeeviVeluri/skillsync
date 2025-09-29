const Booking = require('../models/Booking');
const User = require('../models/User');

const createBooking = async (req, res) => {
  try {
    const { tutorId, subject, date, timeSlot, duration = 60, message, location = 'Online' } = req.body;
    const learnerId = req.user.id;

    // Validate tutor exists and is a tutor
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    // Check if learner is trying to book with themselves
    if (learnerId === tutorId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book a session with yourself'
      });
    }

    // Check if tutor teaches the requested subject
    if (!tutor.subjects.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: 'Tutor does not teach this subject'
      });
    }

    // Check for conflicting bookings (same tutor, date, and time)
    const existingBooking = await Booking.findOne({
      tutor: tutorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked or pending'
      });
    }

    // Create new booking
    const booking = new Booking({
      learner: learnerId,
      tutor: tutorId,
      subject,
      date: new Date(date),
      timeSlot,
      duration,
      message,
      location,
      status: 'pending'
    });

    await booking.save();

    // Populate the booking with user details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('learner', 'firstName lastName email')
      .populate('tutor', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully',
      data: populatedBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming } = req.query;

    console.log('🔍 getBookings called:', {
      userId,
      userRole: req.user.role,
      query: req.query
    });

    // Build filter based on user role
    let filter = {};
    if (req.user.role === 'learner') {
      filter.learner = userId;
    } else if (req.user.role === 'tutor') {
      filter.tutor = userId;
    }

    console.log('📊 Filter applied:', filter);

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add upcoming filter if requested
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['pending', 'accepted'] };
    }

    const bookings = await Booking.find(filter)
      .populate('learner', 'firstName lastName email university school')
      .populate('tutor', 'firstName lastName email university school subjects')
      .sort({ date: 1, timeSlot: 1 });

    console.log('📋 Found bookings:', bookings.length);
    console.log('📋 Booking statuses:', bookings.map(b => b.status));

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate('learner', 'firstName lastName email university school')
      .populate('tutor', 'firstName lastName email university school subjects');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is involved in this booking
    if (booking.learner._id.toString() !== userId && booking.tutor._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, message } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only tutor can accept/reject, both parties can cancel/complete
    if (status === 'accepted' || status === 'rejected') {
      if (booking.tutor.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the tutor can accept or reject booking requests'
        });
      }
    } else if (status === 'cancelled') {
      if (booking.learner.toString() !== userId && booking.tutor.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (status === 'completed') {
      if (booking.tutor.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the tutor can mark sessions as completed'
        });
      }
    }

    // Update booking status
    booking.status = status;
    if (message) {
      booking.message = message;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate('learner', 'firstName lastName email')
      .populate('tutor', 'firstName lastName email');

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getTutorAvailability = async (req, res) => {
  try {
    const { tutorId, date } = req.query;

    if (!tutorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Tutor ID and date are required'
      });
    }

    // Get all bookings for this tutor on the specified date
    const bookings = await Booking.find({
      tutor: tutorId,
      date: new Date(date),
      status: { $in: ['pending', 'accepted'] }
    }).select('timeSlot');

    // Extract booked time slots
    const bookedSlots = bookings.map(booking => booking.timeSlot);

    // Define available time slots (you can make this configurable)
    const allSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
      '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({
      success: true,
      data: {
        date,
        availableSlots,
        bookedSlots
      }
    });

  } catch (error) {
    console.error('Get tutor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getTutorAvailability
};