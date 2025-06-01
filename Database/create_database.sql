-- XÓA VÀ TẠO LẠI DATABASE
DROP DATABASE IF EXISTS `tpcomputer`;
CREATE DATABASE `tpcomputer` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tpcomputer`;

-- BẢNG VAI TRÒ
CREATE TABLE tblRole (
  roleID INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(20) NOT NULL,
  description VARCHAR(255)
);

-- BẢNG NGƯỜI DÙNG
CREATE TABLE tblUser (
  userID INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  lastname VARCHAR(255),
  firstname VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(255),
  roleID INT,
  FOREIGN KEY (roleID) REFERENCES tblRole(roleID)
);

-- BẢNG DANH MỤC
CREATE TABLE tblCategory (
  categoryID INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

-- BẢNG SẢN PHẨM
CREATE TABLE tblProduct (
  productID INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  image VARCHAR(255),
  stockQuantity INT,
  description TEXT,
  categoryID INT,
  FOREIGN KEY (categoryID) REFERENCES tblCategory(categoryID)
);

-- BẢNG THUỘC TÍNH SẢN PHẨM (GỘP)
CREATE TABLE tblProductAtt (
  productAttID INT PRIMARY KEY AUTO_INCREMENT,
  productID INT,
  attName VARCHAR(255) NOT NULL,
  attValue VARCHAR(255),
  unit VARCHAR(50),
  FOREIGN KEY (productID) REFERENCES tblProduct(productID)
);

-- BẢNG GIỎ HÀNG
CREATE TABLE tblCart (
  cartID INT PRIMARY KEY AUTO_INCREMENT,
  userID INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES tblUser(userID)
);

-- BẢNG CHI TIẾT GIỎ HÀNG
CREATE TABLE tblCartDetail (
  cartDetailID INT PRIMARY KEY AUTO_INCREMENT,
  cartID INT,
  productID INT,
  quantity INT,
  FOREIGN KEY (cartID) REFERENCES tblCart(cartID),
  FOREIGN KEY (productID) REFERENCES tblProduct(productID)
);

-- BẢNG ĐƠN HÀNG
CREATE TABLE tblOrder (
  orderID INT PRIMARY KEY AUTO_INCREMENT,
  userID INT,
  orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  totalAmount DECIMAL(15,2),
  status VARCHAR(50),
  FOREIGN KEY (userID) REFERENCES tblUser(userID)
);

-- BẢNG CHI TIẾT ĐƠN HÀNG
CREATE TABLE tblOrderDetail (
  orderDetailID INT PRIMARY KEY AUTO_INCREMENT,
  orderID INT,
  productID INT,
  quantity INT,
  price DECIMAL(15,2),
  FOREIGN KEY (orderID) REFERENCES tblOrder(orderID),
  FOREIGN KEY (productID) REFERENCES tblProduct(productID)
);

-- BẢNG ĐÁNH GIÁ
CREATE TABLE tblReview (
  reviewID INT PRIMARY KEY AUTO_INCREMENT,
  productID INT,
  userID INT,
  rating INT,
  comment VARCHAR(255),
  reviewDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productID) REFERENCES tblProduct(productID),
  FOREIGN KEY (userID) REFERENCES tblUser(userID)
);

-- BẢNG GIẢM GIÁ
CREATE TABLE tblDiscount (
  discountID INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  value DECIMAL(10,2),
  description VARCHAR(255),
  startDate DATE,
  endDate DATE
);

-- BẢNG LIÊN KẾT SẢN PHẨM VỚI GIẢM GIÁ
CREATE TABLE tblProductDiscount (
  productDiscountID INT PRIMARY KEY AUTO_INCREMENT,
  productID INT,
  discountID INT,
  FOREIGN KEY (productID) REFERENCES tblProduct(productID),
  FOREIGN KEY (discountID) REFERENCES tblDiscount(discountID)
);

-- BẢNG HÌNH ẢNH SẢN PHẨM
CREATE TABLE tblProductImage (
  productImageID INT PRIMARY KEY AUTO_INCREMENT,
  productID INT,
  imageUrl VARCHAR(255) NOT NULL,
  altText VARCHAR(255),
  FOREIGN KEY (productID) REFERENCES tblProduct(productID)
);

-- DỮ LIỆU MẪU

-- tblRole
INSERT INTO tblRole (name, description) VALUES
('admin', 'Quản trị viên'),
('user', 'Khách hàng'),
('staff', 'Nhân viên');

-- tblUser
INSERT INTO tblUser (email, password, lastname, firstname, phone, address, roleID) VALUES
('admin@example.com', 'admin123', 'Nguyen', 'Van A', '0901000001', 'Hà Nội', 1),
('user1@example.com', 'user123', 'Tran', 'Thi B', '0901000002', 'TP HCM', 2),
('user2@example.com', 'user456', 'Le', 'Van C', '0901000003', 'Đà Nẵng', 2);

-- tblCategory
INSERT INTO tblCategory (name, description) VALUES
('Laptop', 'Các loại laptop'),
('Phụ kiện', 'Các loại phụ kiện máy tính'),
('Màn hình', 'Màn hình máy tính');

-- tblProduct
INSERT INTO tblProduct (name, price, image, stockQuantity, description, categoryID) VALUES
('Dell XPS 13', 30000000, 'xps13.jpg', 10, 'Laptop cao cấp', 1),
('Logitech Mouse', 500000, 'logitech_mouse.jpg', 50, 'Chuột không dây', 2),
('Samsung Monitor', 4000000, 'samsung_monitor.jpg', 20, 'Màn hình 24 inch', 3);

-- tblProductAtt
INSERT INTO tblProductAtt (productID, attName, attValue, unit) VALUES
(1, 'CPU', 'Intel Core i7', ''),
(1, 'RAM', '16', 'GB'),
(2, 'Kết nối', 'Wireless', '');

-- tblProductImage
INSERT INTO tblProductImage (productID, imageUrl, altText) VALUES
(1, 'xps13_1.jpg', 'Dell XPS 13 - Hình 1'),
(1, 'xps13_2.jpg', 'Dell XPS 13 - Hình 2'),
(3, 'samsung_monitor_1.jpg', 'Samsung Monitor - Hình 1');

-- tblCart
INSERT INTO tblCart (userID, createdAt) VALUES
(2, NOW()),
(3, NOW()),
(1, NOW());

-- tblCartDetail
INSERT INTO tblCartDetail (cartID, productID, quantity) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1);

-- tblOrder
INSERT INTO tblOrder (userID, orderDate, totalAmount, status) VALUES
(2, NOW(), 30500000, 'completed'),
(3, NOW(), 4000000, 'pending'),
(1, NOW(), 500000, 'shipping');

-- tblOrderDetail
INSERT INTO tblOrderDetail (orderID, productID, quantity, price) VALUES
(1, 1, 1, 30000000),
(1, 2, 1, 500000),
(2, 3, 1, 4000000);

-- tblReview
INSERT INTO tblReview (productID, userID, rating, comment, reviewDate) VALUES
(1, 2, 5, 'Sản phẩm rất tốt!', NOW()),
(2, 3, 4, 'Chuột dùng ổn.', NOW()),
(3, 1, 5, 'Màn hình sắc nét.', NOW());

-- tblDiscount
INSERT INTO tblDiscount (name, value, description, startDate, endDate) VALUES
('Giảm giá mùa hè', 10, 'Giảm 10%', '2025-05-01', '2025-05-31'),
('Black Friday', 20, 'Giảm 20%', '2025-11-25', '2025-11-30'),
('Tết Sale', 15, 'Giảm 15%', '2026-01-10', '2026-01-20');

-- tblProductDiscount
INSERT INTO tblProductDiscount (productID, discountID) VALUES
(1, 1),
(2, 2),
(3, 3);
