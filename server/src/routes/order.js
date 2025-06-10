const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../controllers/authController');

// Tạo đơn hàng
router.post('/', authenticateToken, orderController.createOrder);

// Nhận callback từ MoMo
router.post('/momo/callback', orderController.handleMomoCallback);

// Xác nhận thanh toán VNPay
router.post('/confirm-payment', authenticateToken, orderController.confirmPayment);

// Lấy danh sách đơn hàng với bộ lọc (Admin)
router.get('/', isAdmin, orderController.getOrders);

// Lấy chi tiết đơn hàng (Admin)
router.get('/:id', isAdmin, orderController.getOrderDetails);

// Cập nhật trạng thái đơn hàng (Admin)
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);

// Lấy thống kê đơn hàng (Admin)
router.get('/stats/overview', isAdmin, orderController.getOrderStats);

module.exports = router; 