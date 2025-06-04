const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

// Lấy tất cả khuyến mại
router.get('/', discountController.getAllDiscounts);
// Lấy khuyến mại theo id
router.get('/:id', discountController.getDiscountById);
// Thêm mới khuyến mại
router.post('/', discountController.createDiscount);
// Cập nhật khuyến mại
router.put('/:id', discountController.updateDiscount);
// Xóa khuyến mại
router.delete('/:id', discountController.deleteDiscount);

module.exports = router; 