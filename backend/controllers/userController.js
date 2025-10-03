const User = require('../models/User');
const Booking = require('../models/Booking');

// Get user dashboard statistics
const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'learner') {
      // Learner statistics
      const bookings = await Booking.find({ learner: userId });

      const totalSessions = bookings.length;
      const completedSessions = bookings.filter(b => b.status === 'completed').length;
      const upcomingSessions = bookings.filter(b => b.status === 'accepted' && new Date(b.date) >= new Date()).length;
      const pendingSessions = bookings.filter(b => b.status === 'pending').length;

      // Calculate hours learned (assuming each session is 1 hour by default)
      const hoursLearned = completedSessions;

      // Get recent sessions
      const recentSessions = await Booking.find({ learner: userId })
        .populate('tutor', 'firstName lastName subjects')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalSessions,
        completedSessions,
        upcomingSessions,
        pendingSessions,
        hoursLearned,
        averageRating: completedSessions > 0 ? (4.2 + Math.random() * 0.6).toFixed(1) : '0.0', // Mock rating for now
        recentSessions: recentSessions.map(session => ({
          id: session._id,
          subject: session.subject,
          tutorName: `${session.tutor.firstName} ${session.tutor.lastName}`,
          date: session.date,
          timeSlot: session.timeSlot,
          status: session.status
        }))
      };

    } else if (userRole === 'tutor') {
      // Tutor statistics
      const bookings = await Booking.find({ tutor: userId });

      const totalSessions = bookings.length;
      const completedSessions = bookings.filter(b => b.status === 'completed').length;
      const upcomingSessions = bookings.filter(b => b.status === 'accepted' && new Date(b.date) >= new Date()).length;
      const pendingSessions = bookings.filter(b => b.status === 'pending').length;

      // Calculate hours taught
      const hoursTaught = completedSessions;

      // Calculate earnings (mock for now - $20 per hour)
      const totalEarnings = completedSessions * 20;

      // Get unique students
      const uniqueStudents = [...new Set(bookings.map(b => b.learner.toString()))];

      // Get recent sessions
      const recentSessions = await Booking.find({ tutor: userId })
        .populate('learner', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5);

      stats = {
        totalSessions,
        completedSessions,
        upcomingSessions,
        pendingSessions,
        hoursTaught,
        totalEarnings,
        uniqueStudents: uniqueStudents.length,
        averageRating: completedSessions > 0 ? (4.5 + Math.random() * 0.4).toFixed(1) : '0.0', // Mock rating for now
        recentSessions: recentSessions.map(session => ({
          id: session._id,
          subject: session.subject,
          studentName: `${session.learner.firstName} ${session.learner.lastName}`,
          date: session.date,
          timeSlot: session.timeSlot,
          status: session.status
        }))
      };
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          role: req.user.role,
          university: req.user.university,
          year: req.user.year,
          subjects: req.user.subjects
        },
        stats
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// Get user's upcoming sessions
const getUpcomingSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    let populateField = '';

    if (userRole === 'learner') {
      query = { learner: userId, status: { $in: ['pending', 'accepted'] } };
      populateField = 'tutor';
    } else {
      query = { tutor: userId, status: { $in: ['pending', 'accepted'] } };
      populateField = 'learner';
    }

    const upcomingSessions = await Booking.find(query)
      .populate(populateField, 'firstName lastName email')
      .sort({ date: 1, timeSlot: 1 })
      .limit(10);

    const formattedSessions = upcomingSessions.map(session => ({
      id: session._id,
      subject: session.subject,
      date: session.date,
      timeSlot: session.timeSlot,
      duration: session.duration,
      location: session.location,
      status: session.status,
      [userRole === 'learner' ? 'tutor' : 'student']: {
        name: `${session[populateField].firstName} ${session[populateField].lastName}`,
        email: session[populateField].email
      }
    }));

    res.json({
      success: true,
      data: formattedSessions
    });

  } catch (error) {
    console.error('Upcoming sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming sessions'
    });
  }
};

// Get user's recent activity
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query = {};
    let populateField = '';

    if (userRole === 'learner') {
      query = { learner: userId };
      populateField = 'tutor';
    } else {
      query = { tutor: userId };
      populateField = 'learner';
    }

    const recentBookings = await Booking.find(query)
      .populate(populateField, 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(15);

    const activities = recentBookings.map(booking => {
      const otherPerson = booking[populateField];
      const personName = `${otherPerson.firstName} ${otherPerson.lastName}`;

      let activityText = '';
      switch (booking.status) {
        case 'pending':
          activityText = userRole === 'learner'
            ? `Requested a session with ${personName} for ${booking.subject}`
            : `${personName} requested a session for ${booking.subject}`;
          break;
        case 'accepted':
          activityText = `Session confirmed with ${personName} for ${booking.subject}`;
          break;
        case 'completed':
          activityText = `Completed session with ${personName} for ${booking.subject}`;
          break;
        case 'cancelled':
          activityText = `Session cancelled with ${personName} for ${booking.subject}`;
          break;
        default:
          activityText = `Updated session with ${personName} for ${booking.subject}`;
      }

      return {
        id: booking._id,
        text: activityText,
        date: booking.createdAt,
        type: booking.status,
        subject: booking.subject
      };
    });

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity'
    });
  }
};

module.exports = {
  getUserDashboardStats,
  getUpcomingSessions,
  getRecentActivity
};