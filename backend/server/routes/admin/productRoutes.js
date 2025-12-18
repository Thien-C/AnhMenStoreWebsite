const express = require('express');
const router = express.Router();

const adminMiddleware = require('../../middleware/adminMiddleware');
const productController = require('../../controllers/productController');

// Bảo vệ toàn bộ route bằng adminMiddleware
router.use(adminMiddleware);

// GET /api/admin/products - Lấy danh sách sản phẩm
router.get('/', productController.getAllProductsAdmin);

// GET /api/admin/products/:id - Lấy chi tiết sản phẩm
router.get('/:id', productController.getProductDetailAdmin);

// POST /api/admin/products - Tạo sản phẩm mới
router.post('/', productController.createProductAdmin);

// PUT /api/admin/products/:id - Cập nhật sản phẩm
router.put('/:id', productController.updateProductAdmin);

// DELETE /api/admin/products/:id - Xóa sản phẩm (soft delete)
router.delete('/:id', productController.deleteProductAdmin);

// DELETE /api/admin/products/:id/hard - Xóa vĩnh viễn sản phẩm
router.delete('/:id/hard', productController.hardDeleteProductAdmin);

module.exports = router;


