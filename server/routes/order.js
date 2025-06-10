const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../controllers/authController');

// Tạo đơn hàng
router.post('/', authenticateToken, orderController.createOrder);

// Lấy danh sách đơn hàng
router.get('/', authenticateToken, orderController.getOrders);

// Lấy tất cả đơn hàng cho admin
router.get('/admin', authenticateToken, orderController.getAllOrders);

// Lấy chi tiết đơn hàng
router.get('/:orderId', authenticateToken, orderController.getOrderDetails);

// Cập nhật trạng thái đơn hàng
router.put('/:orderId/status', authenticateToken, orderController.updateOrderStatus);

// Hủy đơn hàng
router.put('/:orderId/cancel', authenticateToken, orderController.cancelOrder);

// Xóa đơn hàng
router.delete('/:orderId', authenticateToken, orderController.deleteOrder);

module.exports = router; 