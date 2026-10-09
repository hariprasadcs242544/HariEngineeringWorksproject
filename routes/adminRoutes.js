const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');

// Rate limiting for admin login route (max 10 attempts per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// Public Auth Route
router.post('/login', loginLimiter, adminController.loginAdmin);
router.post('/logout', adminController.logoutAdmin);

// Protected Admin Routes
router.get('/me', protectAdmin, adminController.getAdminProfile);
router.get('/dashboard-stats', protectAdmin, adminController.getDashboardStats);

module.exports = router;
