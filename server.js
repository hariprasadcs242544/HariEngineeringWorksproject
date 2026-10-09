require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Import controllers & routes
const productRoutes = require('./routes/productRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blowerController = require('./controllers/blowerController');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allowed inline scripts and external FontAwesome icons
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting for Public Submissions
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per window
  message: { success: false, error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/enquiries', publicApiLimiter, enquiryRoutes);
app.post('/api/suggest-blower', publicApiLimiter, blowerController.suggestBlower);

// Page Routing (Clean URLs mapping to HTML files in public folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/product-detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-detail.html'));
});

app.get('/blower-selector', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blower-selector.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/industries', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'industries.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/track', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'track.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 404 Error Handler
app.use((req, res, next) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=====================================================`);
    console.log(`  HARI ENGINEERING WORKS - B2B INDUSTRIAL PORTAL    `);
    console.log(`  Server running at: http://localhost:${PORT}        `);
    console.log(`=====================================================`);
  });
}

// Export app for Vercel serverless runtime
module.exports = app;
