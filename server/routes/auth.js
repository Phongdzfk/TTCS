const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Lấy thông tin user đã đăng nhập
router.get('/profile', authController.authenticateToken, authController.getProfile);

module.exports = router;
