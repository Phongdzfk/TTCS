const db = require('../config/db');

exports.getAllCategories = async () => {
  const [categories] = await db.query('SELECT * FROM tblCategory');
  return categories;
};

exports.addCategory = async (body) => {
  const { name, description } = body;
  if (!name) {
    const err = new Error('Tên danh mục là bắt buộc.');
    err.status = 400;
    throw err;
  }
  await db.query('INSERT INTO tblCategory (name, description) VALUES (?, ?)', [name, description]);
  return;
};

exports.deleteCategory = async (id) => {
  const [result] = await db.query('DELETE FROM tblCategory WHERE categoryID = ?', [id]);
  return result;
};
