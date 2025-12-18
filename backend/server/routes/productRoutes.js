const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/master-data', productController.getMasterData);
router.get('/categories', productController.getCategories); // ✅ Thêm route categories
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);
router.post('/variants', productController.getVariantsByIds);

module.exports = router;