const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/admin/reportController');
const authMiddleware = require('../../middleware/authMiddleware');
const adminMiddleware = require('../../middleware/adminMiddleware');

// Bảo vệ tất cả các route bằng authentication và admin check
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/reports/revenue - Lấy dữ liệu báo cáo doanh thu
router.get('/revenue', reportController.getRevenue);

// GET /api/admin/reports/order-details - Lấy chi tiết đơn hàng
router.get('/order-details', reportController.getOrderDetails);

module.exports = router;
