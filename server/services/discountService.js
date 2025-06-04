const db = require('../config/db');

exports.getAllDiscounts = async () => {
  const [discounts] = await db.query('SELECT * FROM tblDiscount');
  return discounts;
};

exports.getDiscountById = async (id) => {
  const [rows] = await db.query('SELECT * FROM tblDiscount WHERE discountID = ?', [id]);
  return rows[0] || null;
};

exports.createDiscount = async (data) => {
  const { name, value, description, startDate, endDate, productID } = data;
  const [result] = await db.query(
    'INSERT INTO tblDiscount (name, value, description, startDate, endDate) VALUES (?, ?, ?, ?, ?)',
    [name, value, description, startDate, endDate]
  );
  const discountID = result.insertId;
  // Nếu có productID thì tạo liên kết luôn
  if (productID) {
    await db.query('INSERT INTO tblProductDiscount (productID, discountID) VALUES (?, ?)', [productID, discountID]);
  }
  return { discountID, name, value, description, startDate, endDate };
};

exports.updateDiscount = async (id, data) => {
  const { name, value, description, startDate, endDate, productID } = data;
  await db.query(
    'UPDATE tblDiscount SET name=?, value=?, description=?, startDate=?, endDate=? WHERE discountID=?',
    [name, value, description, startDate, endDate, id]
  );
  // Nếu có productID thì tạo liên kết luôn (nếu chưa có)
  if (productID) {
    const [rows] = await db.query('SELECT * FROM tblProductDiscount WHERE productID=? AND discountID=?', [productID, id]);
    if (rows.length === 0) {
      await db.query('INSERT INTO tblProductDiscount (productID, discountID) VALUES (?, ?)', [productID, id]);
    }
  }
  return { discountID: id, name, value, description, startDate, endDate };
};

exports.deleteDiscount = async (id) => {
  await db.query('DELETE FROM tblDiscount WHERE discountID = ?', [id]);
}; 