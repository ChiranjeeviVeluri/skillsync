const express = require('express');
const router = express.Router();
const {
  submitRating,
  getRatings,
  getTutorRatingStats
} = require('../controllers/ratingController');
const auth = require('../middleware/auth');

// POST /api/ratings - Submit a new rating (learners only)
router.post('/', auth, submitRating);

// GET /api/ratings - Get ratings (with optional tutor filter)
router.get('/', auth, getRatings);

// GET /api/ratings/tutor/:tutorId/stats - Get rating statistics for a specific tutor
router.get('/tutor/:tutorId/stats', auth, getTutorRatingStats);

module.exports = router;