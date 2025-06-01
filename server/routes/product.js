const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Thiết lập lưu file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Lấy tất cả sản phẩm
router.get('/', productController.getAllProducts);
// Lấy tất cả sản phẩm có discount còn hiệu lực
router.get('/discounts', productController.getAllProductDiscounts);
// Lấy danh sách sản phẩm nổi bật (isFeatured = 1, giới hạn 8)
router.get('/featured', productController.getFeaturedProducts);
// Lấy danh sách thuộc tính động cho từng category
router.get('/attributes', productController.getFilterAttributes);
// Lấy chi tiết sản phẩm theo id
router.get('/:id', productController.getProductById);
// Thêm sản phẩm mới
router.post('/', upload.array('images'), productController.addProduct);
// Cập nhật sản phẩm
router.put('/:id', upload.array('images'), productController.updateProduct);
// Xóa sản phẩm
router.delete('/:id', productController.deleteProduct);
module.exports = router;
