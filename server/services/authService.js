const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async ({ email, password, lastname, firstname, phone, address }) => {
  // Kiểm tra trùng email
  const [users] = await db.query('SELECT * FROM tblUser WHERE email = ?', [email]);
  if (users.length > 0) {
    const err = new Error('Email đã tồn tại!');
    err.status = 400;
    throw err;
  }
  // Băm mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);
  // Thêm user mới
  await db.query(
    'INSERT INTO tblUser (email, password, lastname, firstname, phone, address, roleID) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [email, hashedPassword, lastname, firstname, phone, address, 2]
  );
  return;
};

exports.login = async ({ email, password }) => {
  // Tìm user theo email
  const [users] = await db.query('SELECT * FROM tblUser WHERE email = ?', [email]);
  if (users.length === 0) {
    const err = new Error('Tài khoản không tồn tại!');
    err.status = 400;
    throw err;
  }
  const user = users[0];
  // So sánh mật khẩu
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Sai mật khẩu!');
    err.status = 400;
    throw err;
  }
  // Tạo token JWT
  const token = jwt.sign(
    { userID: user.userID, email: user.email, roleID: user.roleID },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  // Trả về thông tin user (trừ password) và token
  const { password: pw, ...userData } = user;
  return { user: userData, token };
};

exports.getProfile = async (userID) => {
  const [users] = await db.query('SELECT userID, email, lastname, firstname, phone, address, roleID FROM tblUser WHERE userID = ?', [userID]);
  if (users.length === 0) {
    const err = new Error('Không tìm thấy người dùng!');
    err.status = 404;
    throw err;
  }
  return users[0];
};
