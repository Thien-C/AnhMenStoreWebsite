const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/master-data', productController.getMasterData); // Để trên cùng để tránh nhầm với :id
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

module.exports = router;