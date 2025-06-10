const db = require('../config/db');

exports.getReviewsByProduct = async (productID) => {
  const [rows] = await db.query(
    `SELECT r.*, u.firstname, u.lastname FROM tblreview r
     LEFT JOIN tbluser u ON r.userID = u.userID
     WHERE r.productID = ?
     ORDER BY r.reviewDate DESC`,
    [productID]
  );
  return rows;
};

exports.addReview = async ({ productID, userID, rating, comment }) => {
  const [result] = await db.query(
    'INSERT INTO tblreview (productID, userID, rating, comment, reviewDate) VALUES (?, ?, ?, ?, NOW())',
    [productID, userID, rating, comment]
  );
  return { reviewID: result.insertId, productID, userID, rating, comment };
};

exports.deleteReview = async (reviewID, userID, roleID) => {
  // Chỉ admin hoặc chính chủ mới được xóa
  const [rows] = await db.query('SELECT * FROM tblreview WHERE reviewID = ?', [reviewID]);
  if (!rows.length) throw new Error('Không tìm thấy đánh giá');
  if (roleID !== 1 && rows[0].userID !== userID) throw new Error('Không có quyền xóa');
  await db.query('DELETE FROM tblreview WHERE reviewID = ?', [reviewID]);
};

exports.updateReview = async (reviewID, userID, rating, comment) => {
  // Chỉ chính chủ mới được sửa
  const [rows] = await db.query('SELECT * FROM tblreview WHERE reviewID = ?', [reviewID]);
  if (!rows.length) throw new Error('Không tìm thấy đánh giá');
  if (rows[0].userID !== userID) throw new Error('Không có quyền sửa');
  await db.query('UPDATE tblreview SET rating = ?, comment = ? WHERE reviewID = ?', [rating, comment, reviewID]);
  return { reviewID, rating, comment };
};