const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// In-memory counter fallback when DB is disconnected
const memoryCounters = {};

/**
 * Safely generates an atomic, unique daily token (e.g., ORD-20261009-0001)
 * @param {string} type - 'Order', 'RFQ', 'Service Request', 'General Enquiry'
 * @returns {Promise<string>}
 */
async function generateToken(type = 'RFQ') {
  let prefix = 'RFQ';
  const typeLower = (type || '').toLowerCase();
  if (typeLower.includes('order')) {
    prefix = 'ORD';
  } else if (typeLower.includes('service')) {
    prefix = 'SRV';
  } else if (typeLower.includes('rfq') || typeLower.includes('quote')) {
    prefix = 'RFQ';
  } else {
    prefix = 'ENQ';
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const counterId = `${prefix}-${dateStr}`;

  let seqNum = 1;

  if (mongoose.connection.readyState === 1) {
    try {
      const result = await Counter.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      seqNum = result.seq;
    } catch (err) {
      console.error('[Counter Error] Fallback to memory sequence:', err.message);
      memoryCounters[counterId] = (memoryCounters[counterId] || 0) + 1;
      seqNum = memoryCounters[counterId];
    }
  } else {
    memoryCounters[counterId] = (memoryCounters[counterId] || 0) + 1;
    seqNum = memoryCounters[counterId];
  }

  const runningNumber = String(seqNum).padStart(4, '0');
  return `${prefix}-${dateStr}-${runningNumber}`;
}

module.exports = {
  Counter,
  generateToken
};
