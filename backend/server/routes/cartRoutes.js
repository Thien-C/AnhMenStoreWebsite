const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Bắt buộc đăng nhập
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.post('/merge', cartController.mergeCart);
router.put('/update', cartController.updateCartItem);
router.delete('/:id', cartController.removeCartItem);
module.exports = router;