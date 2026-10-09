const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// Public route to track request status by Token Number
router.get('/track/:token', enquiryController.trackEnquiry);

// Public route to submit new enquiry / RFQ / Order / Service Request
router.post('/', enquiryController.createEnquiry);

// Admin enquiry management routes (Protected by auth middleware in Phase 3)
router.get('/', enquiryController.getEnquiries);
router.put('/:id', enquiryController.updateEnquiryStatus);
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;
