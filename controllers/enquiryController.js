const Enquiry = require('../models/Enquiry');
const mongoose = require('mongoose');
const { generateToken } = require('../models/Counter');
const { sendTokenEmail } = require('../utils/mailer');

// Fallback in-memory storage for enquiries when DB is offline
const MEMORY_ENQUIRIES = [
  {
    _id: "enq_101",
    token: "RFQ-20261009-0001",
    type: "RFQ",
    name: "Rajesh Kumar",
    company: "Apex Textile Mills Ltd",
    email: "rkumar@apextextiles.com",
    phone: "+91 98765 43210",
    productInterested: "Heavy-Duty Industrial Axial Flow Fan",
    message: "We need an estimate for 8 units of 1200mm diameter axial flow fans for our spinning department exhaust.",
    status: "New",
    adminNotes: "Client requested delivery timeline within 3 weeks.",
    adminReply: "Our technical team has reviewed your specifications. Formal quote sent via email.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    _id: "enq_102",
    token: "SRV-20261009-0002",
    type: "Service Request",
    name: "Priya Sharma",
    company: "Sun Pharma Solutions",
    email: "psharma@sunpharmasol.in",
    phone: "+91 98123 45678",
    productInterested: "Pulse-Jet Bag Filter Dust Collector",
    message: "Requesting technical datasheet and quotation for 15,000 CFM Pulse-Jet Dust Collector with PTFE membrane bags.",
    status: "In Progress",
    adminNotes: "Engineer scheduled for site visit on Monday.",
    adminReply: "Service technician assigned. Site inspection scheduled.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  }
];

// Helper to notify socket clients if socket IO app instance is attached
function getIO(req) {
  return req.app.get('io');
}

// POST /api/enquiries - Submit new Enquiry / RFQ / Order / Service Request
exports.createEnquiry = async (req, res) => {
  try {
    const { name, company, email, phone, productInterested, message, type } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please complete all required fields (Name, Email, Phone, Message).'
      });
    }

    const reqType = type || 'RFQ';
    const token = await generateToken(reqType);

    let createdRecord;

    if (mongoose.connection.readyState === 1) {
      const enquiry = await Enquiry.create({
        token,
        type: reqType,
        name,
        company: company || 'N/A',
        email,
        phone,
        productInterested: productInterested || 'General Industrial Equipment',
        message,
        status: 'New'
      });
      createdRecord = enquiry.toObject();
    } else {
      createdRecord = {
        _id: "enq_" + Date.now(),
        token,
        type: reqType,
        name,
        company: company || 'N/A',
        email,
        phone,
        productInterested: productInterested || 'General Industrial Equipment',
        message,
        status: "New",
        adminNotes: "",
        adminReply: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MEMORY_ENQUIRIES.unshift(createdRecord);
    }

    // Try sending optional email notification if enabled
    sendTokenEmail(createdRecord).catch(err => console.error('[Email Error]', err));

    // Emit Real-time Socket Event to Admin room (Phase 2 integration)
    const io = getIO(req);
    if (io) {
      io.to('admin-room').emit('new-enquiry', {
        token: createdRecord.token,
        id: createdRecord._id,
        name: createdRecord.name,
        company: createdRecord.company,
        type: createdRecord.type,
        productInterested: createdRecord.productInterested,
        status: createdRecord.status,
        message: createdRecord.message,
        createdAt: createdRecord.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully!',
      data: {
        token: createdRecord.token,
        type: createdRecord.type,
        name: createdRecord.name,
        company: createdRecord.company,
        productInterested: createdRecord.productInterested,
        message: createdRecord.message,
        status: createdRecord.status,
        createdAt: createdRecord.createdAt
      }
    });
  } catch (error) {
    console.error('[Create Enquiry Error]', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};

// GET /api/enquiries/track/:token - Public Tracking endpoint (Sanitised)
exports.trackEnquiry = async (req, res) => {
  try {
    const { token } = req.params;
    const cleanToken = (token || '').trim().toUpperCase();

    if (!cleanToken) {
      return res.status(400).json({ success: false, error: 'Reference Token is required' });
    }

    let enquiry = null;

    if (mongoose.connection.readyState === 1) {
      enquiry = await Enquiry.findOne({ token: cleanToken }).lean();
    } else {
      enquiry = MEMORY_ENQUIRIES.find(e => e.token.toUpperCase() === cleanToken);
    }

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        error: `No request found for token "${cleanToken}". Please check the token number and try again.`
      });
    }

    // Return ONLY safe, non-sensitive public details
    return res.status(200).json({
      success: true,
      data: {
        token: enquiry.token,
        type: enquiry.type || 'RFQ',
        status: enquiry.status || 'New',
        productInterested: enquiry.productInterested || 'N/A',
        adminReply: enquiry.adminReply || '',
        createdAt: enquiry.createdAt,
        updatedAt: enquiry.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/enquiries - Admin list of all enquiries
exports.getEnquiries = async (req, res) => {
  try {
    const { search, type, status } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};

      if (type && type !== 'All') {
        query.type = type;
      }
      if (status && status !== 'All') {
        query.status = status;
      }
      if (search) {
        query.$or = [
          { token: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { productInterested: { $regex: search, $options: 'i' } }
        ];
      }

      const enquiries = await Enquiry.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: enquiries.length,
        data: enquiries
      });
    } else {
      let filtered = [...MEMORY_ENQUIRIES];
      if (type && type !== 'All') {
        filtered = filtered.filter(e => (e.type || 'RFQ').toLowerCase() === type.toLowerCase());
      }
      if (status && status !== 'All') {
        filtered = filtered.filter(e => e.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(e =>
          (e.token && e.token.toLowerCase().includes(q)) ||
          e.name.toLowerCase().includes(q) ||
          e.company.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.productInterested.toLowerCase().includes(q)
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/enquiries/:id - Admin update status & notes/reply
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, adminReply } = req.body;

    let updatedEnquiry = null;

    if (mongoose.connection.readyState === 1) {
      const updateData = {};
      if (status) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (adminReply !== undefined) updateData.adminReply = adminReply;

      updatedEnquiry = await Enquiry.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const enq = MEMORY_ENQUIRIES.find(e => e._id === id || e.token === id);
      if (enq) {
        if (status) enq.status = status;
        if (adminNotes !== undefined) enq.adminNotes = adminNotes;
        if (adminReply !== undefined) enq.adminReply = adminReply;
        enq.updatedAt = new Date().toISOString();
        updatedEnquiry = enq;
      }
    }

    if (!updatedEnquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry record not found' });
    }

    // Phase 2: Emit socket event to customer's tracking room (keyed by token)
    const io = getIO(req);
    if (io && updatedEnquiry.token) {
      io.to(`tracking-${updatedEnquiry.token}`).emit('status-update', {
        token: updatedEnquiry.token,
        status: updatedEnquiry.status,
        adminReply: updatedEnquiry.adminReply,
        updatedAt: updatedEnquiry.updatedAt
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updatedEnquiry
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/enquiries/:id - Admin delete enquiry
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const enquiry = await Enquiry.findByIdAndDelete(id);
      if (!enquiry) return res.status(404).json({ success: false, error: 'Enquiry not found' });
      return res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
    } else {
      const index = MEMORY_ENQUIRIES.findIndex(e => e._id === id || e.token === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'Enquiry not found' });
      MEMORY_ENQUIRIES.splice(index, 1);
      return res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
