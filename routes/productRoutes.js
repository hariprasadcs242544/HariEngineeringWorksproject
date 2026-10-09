const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const { protectAdmin } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images/products'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const rawName = req.body.slug || file.originalname.split('.')[0];
    const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    cb(null, `${slug}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Only JPG, PNG, WEBP, and SVG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: fileFilter
});

// Image Upload Endpoint (Admin Protected)
router.post('/upload-image', protectAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file uploaded' });
  }
  const relPath = `/images/products/${req.file.filename}`;
  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl: relPath
  });
});

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes (Protected by auth middleware)
router.post('/', protectAdmin, productController.createProduct);
router.put('/:id', protectAdmin, productController.updateProduct);
router.delete('/:id', protectAdmin, productController.deleteProduct);

module.exports = router;
