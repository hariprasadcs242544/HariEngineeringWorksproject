const mongoose = require('mongoose');
const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const { generateToken } = require('../models/Counter');
const { calculateDutyPoint, matchBlowers } = require('../utils/blowerCalculator');
const { FALLBACK_PRODUCTS } = require('./productController');

// POST /api/suggest-blower
exports.suggestBlower = async (req, res) => {
  try {
    const {
      numHoods,
      airflowPerHood,
      ductLengthMeters,
      numBends,
      application,
      name,
      phone,
      email,
      company
    } = req.body;

    if (!numHoods || !ductLengthMeters) {
      return res.status(400).json({
        success: false,
        error: 'Please provide required inputs: Number of hoods and total ducting length in meters.'
      });
    }

    // 1. Calculate Duty Point
    const dutyPoint = calculateDutyPoint({
      numHoods,
      airflowPerHood,
      ductLengthMeters,
      numBends,
      application
    });

    // 2. Fetch Products
    let productsList = [];
    if (mongoose.connection.readyState === 1) {
      productsList = await Product.find({ isActive: { $ne: false } }).lean();
    } else {
      productsList = FALLBACK_PRODUCTS;
    }

    // 3. Match Blowers
    const result = matchBlowers(dutyPoint, productsList);

    // 4. Save Suggestion Request as RFQ Enquiry with Token
    let createdToken = await generateToken('RFQ');
    const customerName = (name || '').trim() || 'Anonymous User';
    const customerPhone = (phone || '').trim() || 'N/A';
    const customerEmail = (email || '').trim() || 'noreply@hariengineeringworks.com';

    const matchSummary = result.hasFit && result.top3.length > 0
      ? `Recommended Model: ${result.top3[0].product.name}`
      : 'Custom Engineered Blower Required';

    const reqMessage = `Blower Selector Request - Hoods: ${dutyPoint.numHoods}, Duct Length: ${ductLengthMeters}m, Bends: ${numBends || 0}. Calculated Duty Point: ${dutyPoint.requiredAirflow} m3/h (${dutyPoint.requiredCFM} CFM) @ ${dutyPoint.requiredStaticPressure} mmWG. Recommended Duct Dia: ${dutyPoint.ductDiameterMM} mm. Result: ${matchSummary}`;

    let savedRecord = null;
    if (mongoose.connection.readyState === 1) {
      savedRecord = await Enquiry.create({
        token: createdToken,
        type: 'RFQ',
        name: customerName,
        company: company || 'N/A',
        email: customerEmail,
        phone: customerPhone,
        productInterested: `Blower Selection (${dutyPoint.requiredCFM} CFM @ ${dutyPoint.requiredStaticPressure} mmWG)`,
        message: reqMessage,
        meta: { dutyPoint, top3: result.top3.map(m => ({ name: m.product.name, isFit: m.isFit })) }
      });
    }

    // Socket emit to admin if IO present
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('new-enquiry', {
        token: createdToken,
        name: customerName,
        company: company || 'N/A',
        type: 'RFQ',
        productInterested: `Blower Duty Point Selector (${dutyPoint.requiredCFM} CFM)`,
        status: 'New',
        message: reqMessage,
        createdAt: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      token: createdToken,
      data: {
        dutyPoint,
        top3: result.top3.map(item => ({
          product: {
            _id: item.product._id,
            name: item.product.name,
            slug: item.product.slug,
            category: item.product.category,
            image: item.product.images && item.product.images.length ? item.product.images[0] : '/images/products/high-pressure-direct-drive-centrifugal-blower.png',
            shortDescription: item.product.shortDescription,
            motorKW: item.product.motorKW || 15
          },
          score: item.score,
          isFit: item.isFit,
          reasons: item.reasons
        })),
        hasFit: result.hasFit,
        disclaimer: 'This estimation is based on standard fluid dynamics calculations. Final engineering selection will be verified and confirmed by our technical team.'
      }
    });

  } catch (error) {
    console.error('[Blower Suggestion Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
