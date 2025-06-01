const db = require('../config/db');
const userService = require('../services/userService');

// Lấy tất cả user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUser(id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user.' });
    }
    res.json({ message: 'Cập nhật user thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thêm user mới
exports.createUser = async (req, res) => {
  try {
    await userService.createUser(req.body);
    res.json({ message: 'Thêm người dùng thành công!' });
  } catch (err) {
    if (err.message === 'Email đã tồn tại!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const currentUserId = req.user?.userID;
    const { id } = req.params;
    const result = await userService.deleteUser(id, currentUserId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user để xóa.' });
    }
    res.json({ message: 'Xóa user thành công!' });
  } catch (err) {
    if (err.status === 403) {
      return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
