const express = require('express');
const auth = require('../middleware/auth');
const {
  getUserDashboardStats,
  getUpcomingSessions,
  getRecentActivity
} = require('../controllers/userController');

const router = express.Router();

// GET /api/users/dashboard - Get user dashboard statistics
router.get('/dashboard', auth, getUserDashboardStats);

// GET /api/users/upcoming-sessions - Get user's upcoming sessions
router.get('/upcoming-sessions', auth, getUpcomingSessions);

// GET /api/users/recent-activity - Get user's recent activity
router.get('/recent-activity', auth, getRecentActivity);

module.exports = router;