const express = require('express');
const router = express.Router();
const { createTutor, getTutors, getTutorById, updateTutorProfile } = require('../controllers/tutorController');
const auth = require('../middleware/auth');

// GET /api/tutors - Get all tutors (with optional filters)
router.post('/', createTutor);
router.get('/', getTutors);

// GET /api/tutors/:id - Get specific tutor by ID
router.get('/:id', getTutorById);

// PUT /api/tutors/profile - Update tutor profile (protected)
router.put('/profile', auth, updateTutorProfile);

module.exports = router;