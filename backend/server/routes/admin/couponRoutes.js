const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/admin/couponController');
const adminMiddleware = require('../../middleware/adminMiddleware');
const authMiddleware = require('../../middleware/authMiddleware');

// Tất cả routes đều yêu cầu xác thực và quyền Admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Routes
router.get('/', couponController.getAllCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
