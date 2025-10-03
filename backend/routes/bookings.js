const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  getTutorAvailability
} = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// POST /api/bookings - Create new booking request (learners only)
router.post('/', auth, createBooking);

// GET /api/bookings - Get user's bookings (filtered by role)
router.get('/', auth, getBookings);

// GET /api/bookings/availability - Get tutor availability for specific date
router.get('/availability', auth, getTutorAvailability);

// GET /api/bookings/:id - Get specific booking
router.get('/:id', auth, getBookingById);

// PUT /api/bookings/:id - Update booking status (accept/reject/complete/cancel)
router.put('/:id', auth, updateBookingStatus);

module.exports = router;