const express = require('express');
const { body } = require('express-validator');
const { signup, login, logout, logoutAll, checkTokenStatus } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

const signupValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('First name must be between 1 and 30 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Last name must be between 1 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('university')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('University must be between 1 and 100 characters'),
  body('year')
    .isIn(['1', '2', '3', '4', 'graduate'])
    .withMessage('Year must be 1, 2, 3, 4, or graduate'),
  body('role')
    .isIn(['learner', 'tutor'])
    .withMessage('Role must be either learner or tutor'),
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

router.post('/register', signupValidation, signup);
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);
router.get('/me', auth, checkTokenStatus);

module.exports = router;