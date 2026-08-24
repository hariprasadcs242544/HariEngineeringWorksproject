const Enquiry = require('../models/Enquiry');
const mongoose = require('mongoose');

// Fallback in-memory storage for enquiries when DB is offline
const MEMORY_ENQUIRIES = [
  {
    _id: "enq_101",
    name: "Rajesh Kumar",
    company: "Apex Textile Mills Ltd",
    email: "rkumar@apextextiles.com",
    phone: "+91 98765 43210",
    productInterested: "Heavy-Duty Industrial Axial Flow Fan",
    message: "We need an estimate for 8 units of 1200mm diameter axial flow fans for our spinning department exhaust.",
    status: "New",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    _id: "enq_102",
    name: "Priya Sharma",
    company: "Sun Pharma Solutions",
    email: "psharma@sunpharmasol.in",
    phone: "+91 98123 45678",
    productInterested: "Pulse-Jet Bag Filter Dust Collector",
    message: "Requesting technical datasheet and quotation for 15,000 CFM Pulse-Jet Dust Collector with PTFE membrane bags.",
    status: "Contacted",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  }
];

// POST /api/enquiries
exports.createEnquiry = async (req, res) => {
  try {
    const { name, company, email, phone, productInterested, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please complete all required fields (Name, Email, Phone, Message).'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const enquiry = await Enquiry.create({
        name,
        company: company || 'N/A',
        email,
        phone,
        productInterested: productInterested || 'General Enquiry',
        message
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Your enquiry has been registered. Our engineering sales team will get back to you within 24 hours.',
        data: enquiry
      });
    } else {
      const newEnquiry = {
        _id: "enq_" + Date.now(),
        name,
        company: company || 'N/A',
        email,
        phone,
        productInterested: productInterested || 'General Enquiry',
        message,
        status: "New",
        createdAt: new Date().toISOString()
      };
      MEMORY_ENQUIRIES.unshift(newEnquiry);
      return res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! Your enquiry has been registered. Our engineering sales team will get back to you within 24 hours.',
        data: newEnquiry
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/enquiries (Admin)
exports.getEnquiries = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const enquiries = await Enquiry.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: enquiries.length,
        data: enquiries
      });
    } else {
      return res.status(200).json({
        success: true,
        count: MEMORY_ENQUIRIES.length,
        data: MEMORY_ENQUIRIES
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// PUT /api/enquiries/:id (Admin)
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (mongoose.connection.readyState === 1) {
      const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
      if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
      return res.status(200).json({ success: true, message: 'Status updated', data: enquiry });
    } else {
      const enq = MEMORY_ENQUIRIES.find(e => e._id === id);
      if (!enq) return res.status(404).json({ success: false, error: 'Enquiry not found' });
      enq.status = status;
      return res.status(200).json({ success: true, message: 'Status updated', data: enq });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/enquiries/:id (Admin)
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const enquiry = await Enquiry.findByIdAndDelete(id);
      if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
      return res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
    } else {
      const index = MEMORY_ENQUIRIES.findIndex(e => e._id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Enquiry not found' });
      MEMORY_ENQUIRIES.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
