const express = require('express');
const router = express.Router();
const { registerCustomer, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerCustomer);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
