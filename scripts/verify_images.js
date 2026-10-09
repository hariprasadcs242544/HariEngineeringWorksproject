const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const { FALLBACK_PRODUCTS } = require('../controllers/productController');

async function verifyProductImages() {
  console.log('=====================================================');
  console.log('      PRODUCT IMAGE INTEGRITY VERIFICATION SCRIPT    ');
  console.log('=====================================================');

  const publicImgDir = path.join(__dirname, '..', 'public');
  let productsList = [];

  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      productsList = await Product.find().lean();
      console.log(`Connected to MongoDB. Auditing ${productsList.length} products...`);
    } else {
      productsList = FALLBACK_PRODUCTS;
      console.log(`DB offline. Auditing ${productsList.length} fallback products...`);
    }
  } catch (err) {
    console.log(`DB connection error, checking fallback products list...`);
    productsList = FALLBACK_PRODUCTS;
  }

  let missingCount = 0;
  let verifiedCount = 0;

  productsList.forEach((prod, index) => {
    const images = prod.images && prod.images.length > 0 ? prod.images : [];
    if (images.length === 0) {
      console.error(`[MISSING IMAGE] Product #${index + 1} "${prod.name}" has no image path set.`);
      missingCount++;
      return;
    }

    images.forEach(imgRelPath => {
      // Resolve path
      const cleanPath = imgRelPath.startsWith('/') ? imgRelPath.slice(1) : imgRelPath;
      const fullPath = path.join(publicImgDir, cleanPath);

      if (fs.existsSync(fullPath)) {
        verifiedCount++;
        console.log(`[OK] Product "${prod.name}": File exists -> ${cleanPath}`);
      } else {
        missingCount++;
        console.error(`[FILE NOT FOUND] Product "${prod.name}": Missing file -> ${fullPath}`);
      }
    });
  });

  console.log('-----------------------------------------------------');
  console.log(`Verification Complete: ${verifiedCount} Verified | ${missingCount} Missing.`);
  console.log('=====================================================');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
}

verifyProductImages();
