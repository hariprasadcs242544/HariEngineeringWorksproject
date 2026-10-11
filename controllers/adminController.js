const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');

// Env-configured admin credentials
const ENV_USERNAME = process.env.ADMIN_USERNAME || 'hariew';
const ENV_PASSWORD = process.env.ADMIN_PASSWORD || 'hariprasad';
const ENV_KEY = process.env.ADMIN_KEY || 'hariprasad';
const JWT_SECRET = process.env.JWT_SECRET || 'hari_engineering_secret_jwt_key_2026';

// Ensure the hariew admin user exists in MongoDB (called at startup)
exports.ensureAdminUser = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const existing = await Admin.findOne({ username: ENV_USERNAME });
    if (!existing) {
      await Admin.create({ username: ENV_USERNAME, password: ENV_PASSWORD });
      console.log(`[Admin] Created default admin user: ${ENV_USERNAME}`);
    }
  } catch (err) {
    console.error('[Admin] Failed to ensure admin user:', err.message);
  }
};

// POST /api/admin/login
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = (username || '').trim();
    const pass = password || '';

    if (!user || !pass) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    let isValid = false;

    if (mongoose.connection.readyState === 1) {
      const adminDoc = await Admin.findOne({ username: user });
      if (adminDoc) {
        isValid = await adminDoc.matchPassword(pass);
      } else if (user === ENV_USERNAME && pass === ENV_PASSWORD) {
        // First-run: create the admin document now
        isValid = true;
        await Admin.create({ username: user, password: pass });
        console.log(`[Admin] Auto-created admin: ${user}`);
      }
    } else {
      // DB offline fallback — match env credentials
      if (user === ENV_USERNAME && pass === ENV_PASSWORD) isValid = true;
      if (user === 'admin' && pass === ENV_KEY) isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Administrator credentials.'
      });
    }

    const token = jwt.sign(
      { username: user, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Set httpOnly cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 12 * 3600 * 1000, // 12 hours
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: { username: user }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/admin/logout
exports.logoutAdmin = (req, res) => {
  res.clearCookie('admin_token');
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// GET /api/admin/me
exports.getAdminProfile = (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin
  });
};

// GET /api/admin/dashboard-stats - Metrics & Recent Activity Feed
exports.getDashboardStats = async (req, res) => {
  try {
    let enquiriesList = [];
    let productsCount = 0;

    if (mongoose.connection.readyState === 1) {
      enquiriesList = await Enquiry.find().sort({ createdAt: -1 }).lean();
      productsCount = await Product.countDocuments();
    } else {
      // In-memory fallback
      const { getEnquiries } = require('./enquiryController');
      // Read memory records directly if needed
      enquiriesList = [
        {
          _id: "enq_101",
          token: "RFQ-20261009-0001",
          type: "RFQ",
          name: "Rajesh Kumar",
          company: "Apex Textile Mills Ltd",
          status: "New",
          createdAt: new Date().toISOString()
        }
      ];
      productsCount = 12;
    }

    const stats = {
      orders: {
        new: enquiriesList.filter(e => (e.type === 'Order') && e.status === 'New').length,
        inProgress: enquiriesList.filter(e => (e.type === 'Order') && ['In Review', 'Quoted', 'Confirmed', 'In Progress'].includes(e.status)).length,
        completed: enquiriesList.filter(e => (e.type === 'Order') && e.status === 'Completed').length,
        total: enquiriesList.filter(e => e.type === 'Order').length
      },
      rfqs: {
        new: enquiriesList.filter(e => (e.type === 'RFQ' || !e.type) && e.status === 'New').length,
        inProgress: enquiriesList.filter(e => (e.type === 'RFQ' || !e.type) && ['In Review', 'Quoted', 'Confirmed', 'In Progress'].includes(e.status)).length,
        completed: enquiriesList.filter(e => (e.type === 'RFQ' || !e.type) && e.status === 'Completed').length,
        total: enquiriesList.filter(e => (e.type === 'RFQ' || !e.type)).length
      },
      serviceRequests: {
        new: enquiriesList.filter(e => (e.type === 'Service Request' || e.type === 'Service') && e.status === 'New').length,
        inProgress: enquiriesList.filter(e => (e.type === 'Service Request' || e.type === 'Service') && ['In Review', 'Quoted', 'Confirmed', 'In Progress'].includes(e.status)).length,
        completed: enquiriesList.filter(e => (e.type === 'Service Request' || e.type === 'Service') && e.status === 'Completed').length,
        total: enquiriesList.filter(e => (e.type === 'Service Request' || e.type === 'Service')).length
      },
      totalEnquiries: enquiriesList.length,
      totalProducts: productsCount,
      recentActivity: enquiriesList.slice(0, 5)
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
