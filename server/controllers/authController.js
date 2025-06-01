const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

// Middleware xác thực JWT
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token xác thực!' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ!' });
    req.user = user;
    next();
  });
};

exports.register = async (req, res) => {
  try {
    await authService.register(req.body);
    res.status(201).json({ message: 'Đăng ký thành công!' });
  } catch (err) {
    if (err.status === 400 && err.message === 'Email đã tồn tại!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ message: 'Đăng nhập thành công!', user, token });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.userID);
    res.json({ user });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};