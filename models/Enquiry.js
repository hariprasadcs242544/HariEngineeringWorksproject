const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  token: {
    type: String,
    unique: true,
    index: true,
    required: true
  },
  type: {
    type: String,
    enum: ['Order', 'RFQ', 'Service Request', 'General Enquiry'],
    default: 'RFQ'
  },
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
    enum: ['New', 'In Review', 'Quoted', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'New'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  adminReply: {
    type: String,
    default: ''
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);
