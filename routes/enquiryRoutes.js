const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { protectAdmin } = require('../middleware/auth');

// Public route to track request status by Token Number
router.get('/track/:token', enquiryController.trackEnquiry);

// Public route to submit new enquiry / RFQ / Order / Service Request
router.post('/', enquiryController.createEnquiry);

// Admin-only routes (JWT protected)
router.get('/', protectAdmin, enquiryController.getEnquiries);
router.put('/:id', protectAdmin, enquiryController.updateEnquiryStatus);
router.delete('/:id', protectAdmin, enquiryController.deleteEnquiry);

module.exports = router;
