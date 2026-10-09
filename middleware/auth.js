const jwt = require('jsonwebtoken');

const protectAdmin = (req, res, next) => {
  let token = null;

  // Check header or cookie
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('admin_token='));
    if (authCookie) {
      token = authCookie.split('=')[1];
    }
  }

  // Fallback check header passkey for backward compatibility or simple API calls
  const adminKey = req.headers['x-admin-key'];
  if (adminKey && adminKey === (process.env.ADMIN_KEY || 'admin123')) {
    req.admin = { username: 'admin' };
    return next();
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Admin login required.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'hari_engineering_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired. Please login again.' });
  }
};

module.exports = { protectAdmin };
