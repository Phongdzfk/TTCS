const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.getAllProducts = async (query) => {
  const { search, categoryID, hasDiscount, sort, limit, maxPrice, minPrice, ...dynamicFilters } = query;
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
  // Lọc sản phẩm có discount nếu có hasDiscount
  if (hasDiscount === 'true' || hasDiscount === true) {
    sql += ' AND EXISTS (SELECT 1 FROM tblProductDiscount pd JOIN tblDiscount d ON pd.discountID = d.discountID WHERE pd.productID = p.productID AND d.endDate >= CURDATE())';
  }
  // Lọc theo giá tối đa hoặc tối thiểu
  const priceCondition = `
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM tblProductDiscount pd 
        JOIN tblDiscount d ON pd.discountID = d.discountID 
        WHERE pd.productID = p.productID 
        AND d.endDate >= CURDATE()
      ) THEN p.price * (1 - (
        SELECT d.value/100 
        FROM tblProductDiscount pd 
        JOIN tblDiscount d ON pd.discountID = d.discountID 
        WHERE pd.productID = p.productID 
        AND d.endDate >= CURDATE() 
        ORDER BY d.endDate DESC 
        LIMIT 1
      ))
      ELSE p.price 
    END
  `;
  if (maxPrice) {
    sql += ` AND (${priceCondition}) <= ?`;
    params.push(Number(maxPrice));
  }
  if (minPrice) {
    sql += ` AND (${priceCondition}) >= ?`;
    params.push(Number(minPrice));
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
  // Bổ sung sort random
  let finalSql = sql;
  if (sort === 'random') {
    finalSql += ' ORDER BY RAND()';
  } else if (sort === 'sold') {
    finalSql = `SELECT p.*, SUM(od.quantity) as sold
      FROM tblProduct p
      LEFT JOIN tblorderdetail od ON p.productID = od.productID
      GROUP BY p.productID
      ORDER BY sold DESC`;
  } else {
    finalSql += ' ORDER BY p.createdAt DESC';
  }
  if (limit) {
    finalSql += ' LIMIT ?';
    params.push(Number(limit));
  }
  const [products] = await db.query(finalSql, params);
  // Lấy thuộc tính và ảnh cho từng sản phẩm
  for (const p of products) {
    const [atts] = await db.query('SELECT attName, attValue FROM tblProductAtt WHERE productID=?', [p.productID]);
    p.attributes = atts.map(att => ({ key: att.attName, value: att.attValue }));
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [p.productID]);
    p.images = imgs.map(img => img.imageUrl);
    p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
    // Lấy discount hiện tại (nếu có)
    const [discountRows] = await db.query(`
      SELECT d.* FROM tblProductDiscount pd
      JOIN tblDiscount d ON pd.discountID = d.discountID
      WHERE pd.productID = ? AND d.endDate >= CURDATE()
      ORDER BY d.endDate DESC
      LIMIT 1
    `, [p.productID]);
    p.discount = discountRows[0] || null;
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
    'SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID, p.status, p.isFeatured, p.createdAt, d.discountID, d.value, d.startDate, d.endDate, d.description as discountDescription, d.name as discountName FROM tblProduct p LEFT JOIN tblProductDiscount pd ON p.productID = pd.productID LEFT JOIN tblDiscount d ON pd.discountID = d.discountID WHERE p.isFeatured = 1 ORDER BY p.createdAt DESC LIMIT 8'
  );
  for (const p of products) {
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [p.productID]);
    p.images = imgs.map(img => img.imageUrl);
    p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
    if (p.discountID) {
      p.discount = {
        discountID: p.discountID,
        value: p.value,
        startDate: p.startDate,
        endDate: p.endDate,
        description: p.discountDescription,
        name: p.discountName
      };
    } else {
      p.discount = null;
    }
    delete p.discountID;
    delete p.value;
    delete p.startDate;
    delete p.endDate;
    delete p.discountDescription;
    delete p.discountName;
  }
  return products;
};

exports.getProductById = async (productID) => {
  const [products] = await db.query('SELECT productID, name, price, stockQuantity, description, categoryID, status, isFeatured, createdAt FROM tblProduct WHERE productID = ?', [productID]);
  if (products.length === 0) return [];
  const product = products[0];
  const [atts] = await db.query('SELECT attName, attValue FROM tblProductAtt WHERE productID=?', [productID]);
  product.attributes = atts.map(att => ({ key: att.attName, value: att.attValue }));
  const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=?', [productID]);
  product.images = imgs.map(img => img.imageUrl);
  product.image = imgs.length > 0 ? imgs[0].imageUrl : null;
  // Lấy discount hiện tại (nếu có)
  const [discountRows] = await db.query(`
    SELECT d.* FROM tblProductDiscount pd
    JOIN tblDiscount d ON pd.discountID = d.discountID
    WHERE pd.productID = ? AND d.endDate >= CURDATE()
    ORDER BY d.endDate DESC
    LIMIT 1
  `, [productID]);
  product.discount = discountRows[0] || null;
  return product;
};

exports.getDiscountOfProduct = async (productID) => {
  const [rows] = await db.query(`
    SELECT d.* FROM tblProductDiscount pd
    JOIN tblDiscount d ON pd.discountID = d.discountID
    WHERE pd.productID = ?
    ORDER BY d.endDate DESC
    LIMIT 1
  `, [productID]);
  return rows[0] || null;
};

exports.assignDiscountToProduct = async (productID, discountID) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    
    // Kiểm tra xem discount có tồn tại và còn hiệu lực không
    const [discounts] = await conn.query(
      'SELECT * FROM tblDiscount WHERE discountID = ? AND endDate >= CURDATE()',
      [discountID]
    );
    if (discounts.length === 0) {
      throw new Error('Khuyến mại không tồn tại hoặc đã hết hạn!');
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const [products] = await conn.query('SELECT * FROM tblProduct WHERE productID = ?', [productID]);
    if (products.length === 0) {
      throw new Error('Sản phẩm không tồn tại!');
    }

    // Xóa discount cũ của sản phẩm (nếu có)
    await conn.query('DELETE FROM tblProductDiscount WHERE productID = ?', [productID]);

    // Thêm discount mới
    await conn.query(
      'INSERT INTO tblProductDiscount (productID, discountID) VALUES (?, ?)',
      [productID, discountID]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Gợi ý sản phẩm theo lịch sử mua hàng của user
exports.getRecommendedProducts = async (userID) => {
  // 1. Lấy tất cả productID, categoryID, brand (hãng) user đã mua
  const [boughtRows] = await db.query(`
    SELECT DISTINCT od.productID, p.categoryID, pa.attValue as brand
    FROM tblorder o
    JOIN tblorderdetail od ON o.orderID = od.orderID
    JOIN tblproduct p ON od.productID = p.productID
    LEFT JOIN tblproductatt pa ON p.productID = pa.productID AND pa.attName = 'Hãng'
    WHERE o.userID = ? AND o.status = 'completed'
  `, [userID]);

  if (boughtRows.length === 0) {
    const [randomProducts] = await db.query(
      'SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID FROM tblProduct p ORDER BY RAND() LIMIT 4'
    );
    for (const p of randomProducts) {
      const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=? LIMIT 1', [p.productID]);
      p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
    }
    return randomProducts;
  }

  const boughtProductIDs = boughtRows.map(r => r.productID);
  const boughtCategoryIDs = [...new Set(boughtRows.map(r => r.categoryID))];
  const boughtBrands = [...new Set(boughtRows.map(r => r.brand).filter(Boolean))];

  let suggested = [];
  if (boughtCategoryIDs.length > 0) {
    [suggested] = await db.query(
      `SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID
       FROM tblProduct p
       WHERE p.categoryID IN (${boughtCategoryIDs.map(() => '?').join(',')})
         AND p.productID NOT IN (${boughtProductIDs.map(() => '?').join(',')})
       ORDER BY RAND() LIMIT 4`,
      [...boughtCategoryIDs, ...boughtProductIDs]
    );
  }
  for (const p of suggested) {
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=? LIMIT 1', [p.productID]);
    p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
  }
  if (suggested.length >= 4) {
    return suggested.slice(0, 4);
  }

  let suggestedBrand = [];
  if (boughtBrands.length > 0) {
    [suggestedBrand] = await db.query(
      `SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID
       FROM tblProduct p
       LEFT JOIN tblproductatt pa ON p.productID = pa.productID AND pa.attName = 'Hãng'
       WHERE pa.attValue IN (${boughtBrands.map(() => '?').join(',')})
         AND p.productID NOT IN (${boughtProductIDs.concat(suggested.map(p => p.productID)).map(() => '?').join(',')})
       ORDER BY RAND() LIMIT ?`,
      [...boughtBrands, ...boughtProductIDs, ...suggested.map(p => p.productID), 4 - suggested.length]
    );
    for (const p of suggestedBrand) {
      const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=? LIMIT 1', [p.productID]);
      p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
    }
  }
  let allSuggested = suggested.concat(suggestedBrand);
  if (allSuggested.length >= 4) {
    return allSuggested.slice(0, 4);
  }

  const excludeIDs = boughtProductIDs.concat(allSuggested.map(p => p.productID));
  let randomMore = [];
  if (excludeIDs.length > 0) {
    [randomMore] = await db.query(
      `SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID
       FROM tblProduct p
       WHERE p.productID NOT IN (${excludeIDs.map(() => '?').join(',')})
       ORDER BY RAND() LIMIT ?`,
      [...excludeIDs, 4 - allSuggested.length]
    );
  } else {
    [randomMore] = await db.query(
      `SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID
       FROM tblProduct p
       ORDER BY RAND() LIMIT ?`,
      [4 - allSuggested.length]
    );
  }
  for (const p of randomMore) {
    const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=? LIMIT 1', [p.productID]);
    p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
  }
  if ((allSuggested.concat(randomMore)).length === 0) {
    const [randomProducts] = await db.query(
      'SELECT p.productID, p.name, p.price, p.stockQuantity, p.description, p.categoryID FROM tblProduct p ORDER BY RAND() LIMIT 4'
    );
    for (const p of randomProducts) {
      const [imgs] = await db.query('SELECT imageUrl FROM tblProductImage WHERE productID=? LIMIT 1', [p.productID]);
      p.image = imgs.length > 0 ? imgs[0].imageUrl : null;
    }
    return randomProducts;
  }
  const result = allSuggested.concat(randomMore).slice(0, 4);
  return result;
};
