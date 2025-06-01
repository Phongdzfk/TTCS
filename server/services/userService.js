const db = require('../config/db');

exports.getAllUsers = async () => {
  const [users] = await db.query('SELECT userID, email, lastname, firstname, phone, address, roleID FROM tbluser');
  return users;
};

exports.updateUser = async (id, body) => {
  const { lastname, firstname, phone, address, roleID, status } = body;
  const [result] = await db.query(
    'UPDATE tbluser SET lastname=?, firstname=?, phone=?, address=?, roleID=?, status=? WHERE userID=?',
    [lastname, firstname, phone, address, roleID, status, id]
  );
  return result;
};

exports.createUser = async (body) => {
  const { email, password, lastname, firstname, phone, address, roleID } = body;
  // Kiểm tra email đã tồn tại chưa
  const [exist] = await db.query('SELECT userID FROM tbluser WHERE email=?', [email]);
  if (exist.length > 0) {
    throw new Error('Email đã tồn tại!');
  }
  await db.query(
    'INSERT INTO tbluser (email, password, lastname, firstname, phone, address, roleID) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [email, password, lastname, firstname, phone, address, roleID]
  );
  return;
};

exports.deleteUser = async (id, currentUserId) => {
  if (currentUserId && String(id) === String(currentUserId)) {
    const err = new Error('Bạn không thể xóa chính tài khoản của mình!');
    err.status = 403;
    throw err;
  }
  const [result] = await db.query('DELETE FROM tbluser WHERE userID=?', [id]);
  return result;
};
