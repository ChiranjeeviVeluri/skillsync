const User = require('../models/User');

const getTutors = async (req, res) => {
  try {
    const { subject, availability } = req.query;
    
    let filter = { role: 'tutor' };
    
    if (subject) {
      filter.subjects = { $in: [subject] };
    }
    
    const tutors = await User.find(filter).select('-password');
    
    res.json({
      success: true,
      count: tutors.length,
      data: tutors
    });
  } catch (error) {
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