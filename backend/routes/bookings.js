const express = require('express');
const router = express.Router();
const { 
  createBooking, 
  getBookings, 
  getBookingById, 
  updateBookingStatus, 
  cancelBooking 
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// POST /api/bookings - Create new booking request (learners only)
router.post('/', auth, createBooking);

// GET /api/bookings - Get user's bookings (filtered by role)
router.get('/', auth, getBookings);

// GET /api/bookings/:id - Get specific booking
router.get('/:id', auth, getBookingById);

// PUT /api/bookings/:id/status - Update booking status (tutors only)
router.put('/:id/status', auth, updateBookingStatus);

// PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', auth, cancelBooking);

module.exports = router;