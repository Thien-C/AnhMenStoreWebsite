const express = require('express');
const router = express.Router();

const adminMiddleware = require('../../middleware/adminMiddleware');
const adminOrderController = require('../../controllers/admin/orderController');

// Bảo vệ toàn bộ route bằng adminMiddleware
router.use(adminMiddleware);

// GET /api/admin/orders
router.get('/', adminOrderController.getOrders);

// PUT /api/admin/orders/:id
router.put('/:id', adminOrderController.updateOrderStatus);

module.exports = router;


