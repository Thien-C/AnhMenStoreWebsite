const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Tất cả API dưới đây đều cần đăng nhập

router.get('/profile', userController.getProfile);
router.post('/address', userController.addAddress);
router.put('/address/default/:addressId', userController.setDefaultAddress);
router.delete('/address/:addressId', userController.deleteAddress);
router.get('/orders', userController.getOrderHistory);
router.put('/profile', userController.updateProfile);
router.put('/orders/:id/cancel', userController.cancelOrder);
module.exports = router;