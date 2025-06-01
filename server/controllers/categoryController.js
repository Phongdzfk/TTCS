const db = require('../config/db');
const categoryService = require('../services/categoryService');

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thêm mới danh mục
exports.addCategory = async (req, res) => {
  try {
    await categoryService.addCategory(req.body);
    res.status(201).json({ message: 'Thêm danh mục thành công!' });
  } catch (err) {
    if (err.status === 400 && err.message === 'Tên danh mục là bắt buộc.') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục để xóa.' });
    }
    res.json({ message: 'Xóa danh mục thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};