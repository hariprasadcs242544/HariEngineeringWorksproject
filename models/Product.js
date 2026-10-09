const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Air Control Systems',
      'Industrial Blowers',
      'Axial Flow Fans',
      'Dust Collectors',
      'Scrubbers',
      'Industrial Ducting Systems',
      'Fume/Exhaust Hoods'
    ]
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  fullDescription: {
    type: String,
    required: true
  },
  specifications: [specificationSchema],
  applications: [{
    type: String
  }],
  features: [{
    type: String
  }],
  images: [{
    type: String
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Technical fields for Blower Selector Matching (Phase 5)
  minAirflow: {
    type: Number, // m3/h
    default: 0
  },
  maxAirflow: {
    type: Number, // m3/h
    default: 0
  },
  maxStaticPressure: {
    type: Number, // mmWG or Pa
    default: 0
  },
  motorKW: {
    type: Number, // kW
    default: 0
  },
  blowerType: {
    type: String,
    enum: ['centrifugal', 'axial', 'none'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Auto-generate slug before save if not provided
productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
