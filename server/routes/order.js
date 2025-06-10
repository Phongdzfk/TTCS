const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../controllers/authController');

// Tạo đơn hàng
router.post('/', authenticateToken, orderController.createOrder);
// Nhận callback từ MoMo
router.post('/momo/callback', orderController.handleMomoCallback);
// Xác nhận thanh toán VNPay
router.post('/confirm-payment', authenticateToken, orderController.confirmPayment);

module.exports = router; 