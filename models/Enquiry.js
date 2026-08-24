const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  company: {
    type: String,
    trim: true,
    default: 'N/A'
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  productInterested: {
    type: String,
    default: 'General Enquiry'
  },
  message: {
    type: String,
    required: [true, 'Enquiry message is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['New', 'In Review', 'Contacted', 'Closed'],
    default: 'New'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);
