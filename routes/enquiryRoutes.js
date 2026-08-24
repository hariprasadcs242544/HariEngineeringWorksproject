const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// Submit new enquiry from contact / quote form
router.post('/', enquiryController.createEnquiry);

// Admin enquiry management routes
router.get('/', enquiryController.getEnquiries);
router.put('/:id', enquiryController.updateEnquiryStatus);
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;
