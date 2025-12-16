const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/master-data', productController.getMasterData);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);
router.post('/variants', productController.getVariantsByIds);

module.exports = router;