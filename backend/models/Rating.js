const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },
  subject: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate ratings for same booking
ratingSchema.index({ booking: 1, rater: 1 }, { unique: true });

// Index for efficient tutor rating queries
ratingSchema.index({ tutor: 1 });

module.exports = mongoose.model('Rating', ratingSchema);