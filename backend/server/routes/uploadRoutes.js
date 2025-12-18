const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Upload multiple images (admin only)
router.post('/images', adminMiddleware, ...uploadController.uploadMultipleImages);

// Upload single image (admin only)
router.post('/image', adminMiddleware, ...uploadController.uploadImage);

module.exports = router;