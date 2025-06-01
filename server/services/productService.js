const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getAllProducts = async (query) => {
  const { search, categoryID, ...dynamicFilters } = query;
  let sql = 'SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID, p.status, p.isFeatured, p.createdAt FROM tblProduct p WHERE 1=1';
  const params = [];
  if (categoryID) {
    sql += ' AND p.categoryID = ?';
    params.push(categoryID);
  }
  if (search) {
    sql += ' AND p.name LIKE ?';
    params.push('%' + search + '%');
  }
  // Xử lý filter động (CPU, RAM, ...)
  const filterKeys = Object.keys(dynamicFilters);
  if (filterKeys.length > 0) {
    filterKeys.forEach((attName, idx) => {
      sql += ` AND EXISTS (
        SELECT 1 FROM tblProductAtt pa${idx}
        WHERE pa${idx}.productID = p.productID
          AND pa${idx}.attName = ?
          AND pa${idx}.attValue = ?
      )`;
      params.push(attName, dynamicFilters[attName]);
    });
  }
  const [products] = await db.query(sql, params);
  // Lấy thuộc tính và ảnh cho từng sản phẩm
  for (const p of products) {
    const [atts] = await db.query('SELECT attName, attValue FROM tblProductAtt WHERE productID=?', [p.productID]);
    p.attributes = atts.map(att => ({ key: att.attName, value: att.attValue }));
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [p.productID]);
    p.images = imgs.map(img => img.imageUrl);
  }
  return products;
};

exports.addProduct = async (body, files) => {
  let { name, price, stockQuantity, description, categoryID, status, isFeatured } = body;
  if (!status) status = 'active';
  if (isFeatured === undefined || isFeatured === null || isFeatured === '') isFeatured = 0;
  let attributes = [];
  try {
    attributes = JSON.parse(body.attributes || '[]');
  } catch (e) {
    throw new Error('Thuộc tính không hợp lệ!');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO tblProduct (name, price, stockQuantity, description, categoryID, status, isFeatured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, price, stockQuantity, description, categoryID, status, isFeatured]
    );
    const productID = result.insertId;
    // Thêm thuộc tính động
    for (const att of attributes) {
      await conn.query(
        'INSERT INTO tblProductAtt (productID, attName, attValue) VALUES (?, ?, ?)',
        [productID, att.key, att.value]
      );
    }
    // Thêm ảnh
    for (const file of files) {
      await conn.query(
        'INSERT INTO tblProductImage (productID, imageUrl) VALUES (?, ?)',
        [productID, path.basename(file.path)]
      );
    }
    await conn.commit();
    const [products] = await conn.query('SELECT productID, name, price, stockQuantity, description, categoryID, status, isFeatured, createdAt FROM tblProduct WHERE productID = ?', [productID]);
    return products[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.updateProduct = async (productID, body, files) => {
  let { name, price, stockQuantity, description, categoryID, status, isFeatured } = body;
  let attributes = [];
  try {
    attributes = JSON.parse(body.attributes || '[]');
  } catch (e) {
    throw new Error('Thuộc tính không hợp lệ!');
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'UPDATE tblProduct SET name=?, price=?, stockQuantity=?, description=?, categoryID=?, status=?, isFeatured=? WHERE productID=?',
      [name, price, stockQuantity, description, categoryID, status, isFeatured, productID]
    );
    await conn.query('DELETE FROM tblProductAtt WHERE productID=?', [productID]);
    for (const att of attributes) {
      await conn.query('INSERT INTO tblProductAtt (productID, attName, attValue) VALUES (?, ?, ?)', [productID, att.key, att.value]);
    }
    if (files && files.length > 0) {
      await conn.query('DELETE FROM tblProductImage WHERE productID=?', [productID]);
      for (const file of files) {
        await conn.query('INSERT INTO tblProductImage (productID, imageUrl) VALUES (?, ?)', [productID, path.basename(file.path)]);
      }
    }
    await conn.commit();
    const [products] = await conn.query('SELECT productID, name, price, stockQuantity, description, categoryID, status, isFeatured, createdAt FROM tblProduct WHERE productID = ?', [productID]);
    return products[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.deleteProduct = async (productID) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [images] = await conn.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [productID]);
    for (const img of images) {
      const imgPath = path.join(__dirname, '../uploads', img.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
    await conn.query('DELETE FROM tblProductAtt WHERE productID=?', [productID]);
    await conn.query('DELETE FROM tblProductImage WHERE productID=?', [productID]);
    await conn.query('DELETE FROM tblProduct WHERE productID=?', [productID]);
    await conn.commit();
    return { message: 'Đã xóa sản phẩm thành công!' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

exports.getAllProductDiscounts = async () => {
  const now = new Date();
  const [rows] = await db.query(`
    SELECT pd.productDiscountID, pd.productID, d.discountID, d.name AS discountName, d.value, d.description, d.startDate, d.endDate,
           p.name AS productName, p.price
    FROM tblProductDiscount pd
    JOIN tblDiscount d ON pd.discountID = d.discountID
    JOIN tblProduct p ON pd.productID = p.productID
    WHERE d.endDate > ?
  `, [now]);
  for (const row of rows) {
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=? LIMIT 1', [row.productID]);
    row.image = imgs.length > 0 ? imgs[0].imageUrl : null;
  }
  return rows;
};

exports.getFilterAttributes = async (categoryID) => {
  if (!categoryID) throw new Error('Thiếu categoryID!');
  const [rows] = await db.query(
    `SELECT attName, attValue 
     FROM tblProductAtt 
     WHERE productID IN (SELECT productID FROM tblProduct WHERE categoryID = ?)`,
    [categoryID]
  );
  const attributesMap = {};
  for (const row of rows) {
    if (!attributesMap[row.attName]) attributesMap[row.attName] = new Set();
    attributesMap[row.attName].add(row.attValue);
  }
  const attributes = Object.entries(attributesMap).map(([attName, valueSet]) => ({
    attName,
    values: Array.from(valueSet)
  }));
  return attributes;
};

exports.getFeaturedProducts = async () => {
  const [products] = await db.query(
    'SELECT productID, name, price, stockQuantity, description, categoryID, status, isFeatured, createdAt FROM tblProduct WHERE isFeatured = 1 ORDER BY createdAt DESC LIMIT 8'
  );
  for (const p of products) {
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [p.productID]);
    p.images = imgs.map(img => img.imageUrl);
    p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
  }
  return products;
};

exports.getProductById = async (productID) => {
  const [products] = await db.query('SELECT productID, name, price, stockQuantity, description, categoryID, status, isFeatured, createdAt FROM tblProduct WHERE productID = ?', [productID]);
  if (products.length === 0) throw new Error('Không tìm thấy sản phẩm!');
  const product = products[0];
  const [atts] = await db.query('SELECT attName, attValue FROM tblProductAtt WHERE productID=?', [productID]);
  product.attributes = atts.map(att => ({ key: att.attName, value: att.attValue }));
  const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [productID]);
  product.images = imgs.map(img => img.imageUrl);
  return product;
};
