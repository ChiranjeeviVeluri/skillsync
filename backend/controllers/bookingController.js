const Booking = require('../models/Booking');
const User = require('../models/User');

const createBooking = async (req, res) => {
  try {
    const { tutorId, subject, date, timeSlot, duration, message, location } = req.body;
    
    const tutor = await User.findById(tutorId);
    if (!tutor || tutor.role !== 'tutor') {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }
    
    const booking = new Booking({
      learner: req.user.id,
      tutor: tutorId,
      subject,
      date,
      timeSlot,
      duration,
      message,
      location
    });
    
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('learner', 'name email')
      .populate('tutor', 'name email subjects');
    
    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const { status, role } = req.query;
    
    let filter = {};
    
    if (req.user.role === 'learner') {
      filter.learner = req.user.id;
    } else if (req.user.role === 'tutor') {
      filter.tutor = req.user.id;
    }
    
    if (status) {
      filter.status = status;
    }
    
    const bookings = await Booking.find(filter)
      .populate('learner', 'name email')
      .populate('tutor', 'name email subjects')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('learner', 'name email')
      .populate('tutor', 'name email subjects');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.learner._id.toString() !== req.user.id && 
        booking.tutor._id.toString() !== req.user.id) {
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
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.tutor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor can update booking status'
      });
    }
    
    booking.status = status;
    await booking.save();
    
    const updatedBooking = await Booking.findById(booking._id)
      .populate('learner', 'name email')
      .populate('tutor', 'name email subjects');
    
    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.learner.toString() !== req.user.id && 
        booking.tutor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('learner', 'name email')
      .populate('tutor', 'name email subjects');
    
    // Emit real-time update
    emitBookingUpdate(populatedBooking, 'booking-cancelled');
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: populatedBooking
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
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};