const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [30, 'First name cannot exceed 30 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [30, 'Last name cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true,
    maxlength: [100, 'University name cannot exceed 100 characters']
  },
  year: {
    type: String,
    required: [true, 'Year of study is required'],
    enum: ['1', '2', '3', '4', 'graduate']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['learner', 'tutor'],
    default: 'learner'
  },
  subjects: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);