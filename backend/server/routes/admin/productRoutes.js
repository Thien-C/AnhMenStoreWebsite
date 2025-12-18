const express = require('express');
const router = express.Router();

const adminMiddleware = require('../../middleware/adminMiddleware');
const productController = require('../../controllers/productController');

// Bảo vệ toàn bộ route bằng adminMiddleware
router.use(adminMiddleware);

// POST /api/admin/products
router.post('/', productController.createProductAdmin);

module.exports = router;


