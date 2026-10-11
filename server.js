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
const { ensureAdminUser } = require('./controllers/adminController');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const IS_VERCEL = process.env.VERCEL === '1';

// ─── Socket.IO (real-time, only when not on Vercel serverless) ──────────────
if (!IS_VERCEL) {
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
    });

    // Attach to app so controllers can emit events
    app.set('io', io);

    io.on('connection', (socket) => {
      socket.on('join-admin', () => socket.join('admin-room'));
      socket.on('join-tracking', (token) => {
        if (token) socket.join(`tracking-${token.trim().toUpperCase()}`);
      });
    });

    console.log('[Socket.IO] Real-time server initialized');
  } catch (err) {
    console.warn('[Socket.IO] Not available, real-time features disabled:', err.message);
  }
}

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB().then(() => {
  // Seed admin user hariew/hariprasad if not already in DB
  setTimeout(ensureAdminUser, 2000);
}).catch(() => {});

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many requests. Please try again after 15 minutes.' }
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/enquiries', publicApiLimiter, enquiryRoutes);
app.post('/api/suggest-blower', publicApiLimiter, blowerController.suggestBlower);

// ─── Page Routes (Clean URLs) ────────────────────────────────────────────────
const pages = [
  ['/', 'index.html'],
  ['/about', 'about.html'],
  ['/products', 'products.html'],
  ['/product-detail', 'product-detail.html'],
  ['/blower-selector', 'blower-selector.html'],
  ['/services', 'services.html'],
  ['/industries', 'industries.html'],
  ['/gallery', 'gallery.html'],
  ['/contact', 'contact.html'],
  ['/track', 'track.html'],
  ['/admin', 'admin.html'],
];

pages.forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', file));
  });
});

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// ─── Start Server (local / Render) ──────────────────────────────────────────
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('=====================================================');
    console.log('  HARI ENGINEERING WORKS - B2B INDUSTRIAL PORTAL    ');
    console.log(`  Server running at: http://localhost:${PORT}        `);
    console.log('=====================================================');
  });
}

// Export for Vercel serverless (only app, not server)
module.exports = app;
