const productService = require('../services/productService');
const fs = require('fs');
const path = require('path');

// Lấy tất cả sản phẩm, hỗ trợ filter search, categoryID và filter động
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Thêm sản phẩm mới (đa ảnh, thuộc tính động)
exports.addProduct = async (req, res) => {
  let { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: 'Tên và giá sản phẩm là bắt buộc!' });
  }
  try {
    const product = await productService.addProduct(req.body, req.files || []);
    res.status(201).json({ product });
  } catch (err) {
    if (err.message === 'Thuộc tính không hợp lệ!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.files || []);
    res.json({ product });
  } catch (err) {
    if (err.message === 'Thuộc tính không hợp lệ!') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả sản phẩm đang có discount còn hiệu lực
exports.getAllProductDiscounts = async (req, res) => {
  try {
    const productDiscounts = await productService.getAllProductDiscounts();
    res.json({ productDiscounts });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách thuộc tính động cho từng category (dùng cho filter FE)
exports.getFilterAttributes = async (req, res) => {
  const { categoryID } = req.query;
  if (!categoryID) {
    return res.status(400).json({ message: 'Thiếu categoryID!' });
  }
  try {
    const attributes = await productService.getFilterAttributes(categoryID);
    res.json({ attributes });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách sản phẩm nổi bật (isFeatured = 1, giới hạn 8)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Lấy chi tiết sản phẩm theo id
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
    }
    res.json({ product });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getDiscountOfProduct = async (req, res) => {
  try {
    const discount = await productService.getDiscountOfProduct(req.params.id);
    res.json({ discount });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.assignDiscountToProduct = async (req, res) => {
  try {
    const { discountID } = req.body;
    if (!discountID) {
      return res.status(400).json({ message: 'Thiếu discountID!' });
    }
    await productService.assignDiscountToProduct(req.params.id, discountID);
    res.json({ message: 'Gán khuyến mại thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};
