const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// Public: Xem đánh giá
router.get('/:productId', reviewController.getReviewsByProduct);

// Private: Viết đánh giá (Cần đăng nhập)
router.post('/', authMiddleware, reviewController.addReview);

module.exports = router;