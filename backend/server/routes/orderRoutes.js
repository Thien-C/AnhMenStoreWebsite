const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Route kiểm tra mã giảm giá (không cần auth)
router.post('/check-coupon', orderController.checkCoupon);

// Route tạo đơn hàng (cần auth)
router.post('/', authMiddleware, orderController.createOrder);

module.exports = router;