const express = require('express');
const { body } = require('express-validator');
const { signup, login, logout, logoutAll, checkTokenStatus } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
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

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);
router.get('/me', auth, checkTokenStatus);

module.exports = router;