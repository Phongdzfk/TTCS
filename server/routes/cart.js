const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../controllers/authController');

// Lấy giỏ hàng của user
router.get('/', authenticateToken, cartController.getCart);
// Thêm sản phẩm vào giỏ
router.post('/add', authenticateToken, cartController.addToCart);
// Cập nhật số lượng sản phẩm
router.put('/update', authenticateToken, cartController.updateCartItem);
// Xóa sản phẩm khỏi giỏ
router.delete('/remove/:productId', authenticateToken, cartController.removeCartItem);
// Xóa toàn bộ giỏ hàng
router.delete('/clear', authenticateToken, cartController.clearCart);

module.exports = router; 