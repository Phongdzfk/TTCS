const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Lấy tất cả danh mục
router.get('/', categoryController.getAllCategories);
// Thêm mới danh mục
router.post('/', categoryController.addCategory);
// Xóa danh mục
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
