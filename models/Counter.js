const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// In-memory counter fallback when DB is disconnected
const memoryCounters = {};

/**
 * Safely generates an atomic, unique sequential token:
 * - Order / Purchase: P000001, P000002...
 * - General Enquiry:  E000001, E000002...
 * - Quotation / RFQ:  RFQ000001, RFQ000002...
 * - Service Request:  S000001, S000002...
 *
 * @param {string} type - 'Order', 'Purchase', 'RFQ', 'Service Request', 'General Enquiry'
 * @returns {Promise<string>}
 */
async function generateToken(type = 'RFQ') {
  let prefix = 'RFQ';
  let counterKey = 'counter_rfq';
  const typeLower = (type || '').toLowerCase();

  if (typeLower.includes('order') || typeLower.includes('purchase')) {
    prefix = 'P';
    counterKey = 'counter_order_p';
  } else if (typeLower.includes('service')) {
    prefix = 'S';
    counterKey = 'counter_service_s';
  } else if (typeLower.includes('rfq') || typeLower.includes('quote') || typeLower.includes('quotation')) {
    prefix = 'RFQ';
    counterKey = 'counter_rfq';
  } else {
    // General enquiries / contact messages
    prefix = 'E';
    counterKey = 'counter_enquiry_e';
  }

  let seqNum = 1;

  if (mongoose.connection.readyState === 1) {
    try {
      const result = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      seqNum = result.seq;
    } catch (err) {
      console.error('[Counter Error] Fallback to memory sequence:', err.message);
      memoryCounters[counterKey] = (memoryCounters[counterKey] || 0) + 1;
      seqNum = memoryCounters[counterKey];
    }
  } else {
    memoryCounters[counterKey] = (memoryCounters[counterKey] || 0) + 1;
    seqNum = memoryCounters[counterKey];
  }

  // Zero-padded to 6 digits (e.g. P000001, E000001, RFQ000001, S000001)
  const runningNumber = String(seqNum).padStart(6, '0');
  return `${prefix}${runningNumber}`;
}

module.exports = {
  Counter,
  generateToken
};
