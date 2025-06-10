const db = require('../config/db');
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('qs');

// Cấu hình tài khoản nhận chuyển khoản VietQR
const VIETQR_CONFIG = {
  bankCode: 'MB', // Mã ngân hàng, ví dụ: VCB cho Vietcombank
  accountNumber: '0858262492', // Số tài khoản nhận tiền
  accountName: 'DANG TUAN PHONG' // Tên chủ tài khoản (không bắt buộc cho QR)
};

// Hàm tạo order thực sự trong DB
async function createOrderInDb(orderData, userID) {
  const { customer, orderItems, paymentMethod, total, status: customStatus } = orderData;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // 1. Tạo đơn hàng
    const status = customStatus || (paymentMethod === 'cod' ? 'pending' : 'pending');
    const [orderResult] = await conn.query(
      'INSERT INTO tblorder (userID, orderDate, totalAmount, status, paymentMethod, shippingAddress) VALUES (?, NOW(), ?, ?, ?, ?)',
      [
        userID, 
        total, 
        status, 
        paymentMethod, 
        customer.address
      ]
    );
    const orderID = orderResult.insertId;

    // 2. Thêm chi tiết đơn hàng
    for (const item of orderItems) {
      await conn.query(
        'INSERT INTO tblorderdetail (orderID, productID, quantity, price) VALUES (?, ?, ?, ?)',
        [
          orderID, 
          item.productId, 
          item.quantity, 
          item.price
        ]
      );
    }

    // 3. Xóa giỏ hàng sau khi đặt hàng thành công
    await conn.query('DELETE FROM tblcartdetail WHERE cartID IN (SELECT cartID FROM tblcart WHERE userID = ?)', [userID]);
    await conn.query('DELETE FROM tblcart WHERE userID = ?', [userID]);

    await conn.commit();
    return orderID;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

exports.createOrder = async (orderData, userID) => {
  const { paymentMethod, total } = orderData;
  if (paymentMethod === 'cod') {
    // Tạo order ngay với COD
    const orderID = await createOrderInDb(orderData, userID);
    return { success: true, orderID };
  }
  if (paymentMethod === 'vietqr') {
    // Lấy orderID lớn nhất hiện tại, cộng 1 để dự đoán mã đơn hàng tiếp theo
    const [[{ maxOrderID }]] = await db.query('SELECT MAX(orderID) as maxOrderID FROM tblorder');
    const nextOrderID = (maxOrderID || 0) + 1;
    const amount = Math.round(Number(total));
    // Nội dung chuyển khoản: "Thanh toán đơn hàng <nextOrderID>"
    const addInfo = encodeURIComponent(`Thanh toán đơn hàng ${nextOrderID}`);
    const qrUrl = `https://img.vietqr.io/image/${VIETQR_CONFIG.bankCode}-${VIETQR_CONFIG.accountNumber}-compact2.png?amount=${amount}&addInfo=${addInfo}`;
    // Tạo order ngay với trạng thái chờ xác nhận (pending)
    const orderID = await createOrderInDb({ ...orderData, paymentMethod: 'vietqr', status: 'pending' }, userID);
    return { success: true, qrUrl, orderID: nextOrderID };
  }
  throw new Error('Phương thức thanh toán không hợp lệ!');
};

exports.createOrderInDb = createOrderInDb;

// Lấy danh sách đơn hàng
exports.getOrders = async ({ userID, page, limit, status, search, dateFrom, dateTo }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT o.*, CONCAT(u.lastname, ' ', u.firstname) as customerName, u.email as customerEmail, u.phone as customerPhone
    FROM tblorder o
    LEFT JOIN tbluser u ON o.userID = u.userID
    WHERE o.userID = ?
  `;
  const params = [userID];

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (o.orderID LIKE ? OR CONCAT(u.lastname, \' \' , u.firstname) LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (dateFrom && dateTo) {
    query += ' AND o.orderDate BETWEEN ? AND ?';
    params.push(dateFrom, dateTo);
  }

  // Đếm tổng số records
  const [countResult] = await db.query(
    `SELECT COUNT(*) as total FROM (${query}) as t`,
    params
  );
  const total = countResult[0].total;

  // Lấy dữ liệu với phân trang
  query += ' ORDER BY o.orderDate DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [orders] = await db.query(query, params);

  return {
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (orderId, userID) => {
  // Lấy thông tin đơn hàng
  const [orders] = await db.query(
    `SELECT o.*, CONCAT(u.lastname, ' ', u.firstname) as customerName, u.email as customerEmail, u.phone as customerPhone
     FROM tblorder o
     LEFT JOIN tbluser u ON o.userID = u.userID
     WHERE o.orderID = ? AND o.userID = ?`,
    [orderId, userID]
  );

  if (orders.length === 0) {
    return null;
  }

  const order = orders[0];

  // Lấy chi tiết sản phẩm trong đơn hàng
  const [items] = await db.query(
    `SELECT od.*, p.name as productName, (SELECT imageUrl FROM tblproductimage WHERE productID = p.productID LIMIT 1) as imageUrl
     FROM tblorderdetail od
     LEFT JOIN tblproduct p ON od.productID = p.productID
     WHERE od.orderID = ?`,
    [orderId]
  );

  order.items = items;
  return order;
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (orderId, status, userID) => {
  // Kiểm tra trạng thái hợp lệ
  const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Kiểm tra đơn hàng
    const [orders] = await conn.query(
      'SELECT * FROM tblorder WHERE orderID = ? AND userID = ?',
      [orderId, userID]
    );

    if (orders.length === 0) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // Cập nhật trạng thái
    await conn.query(
      'UPDATE tblorder SET status = ? WHERE orderID = ?',
      [status, orderId]
    );

    await conn.commit();

    // Lấy thông tin đơn hàng sau khi cập nhật
    const [updatedOrders] = await db.query(
      'SELECT * FROM tblorder WHERE orderID = ?',
      [orderId]
    );

    return updatedOrders[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (orderId, userID) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Kiểm tra đơn hàng
    const [orders] = await conn.query(
      'SELECT * FROM tblorder WHERE orderID = ? AND userID = ?',
      [orderId, userID]
    );

    if (orders.length === 0) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    const order = orders[0];

    // Kiểm tra xem có thể hủy không
    if (['completed', 'cancelled'].includes(order.status)) {
      throw new Error('Không thể hủy đơn hàng này');
    }

    // Cập nhật trạng thái
    await conn.query(
      'UPDATE tblorder SET status = ? WHERE orderID = ?',
      ['cancelled', orderId]
    );

    await conn.commit();

    // Lấy thông tin đơn hàng sau khi cập nhật
    const [updatedOrders] = await conn.query(
      'SELECT * FROM tblorder WHERE orderID = ?',
      [orderId]
    );

    return updatedOrders[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Lấy tất cả đơn hàng cho admin
exports.getAllOrders = async ({ page, limit, status, search, dateFrom, dateTo }) => {
  console.log('getAllOrders params:', { page, limit, status, search, dateFrom, dateTo });
  try {
    const offset = (page - 1) * limit;
    let query = `
      SELECT o.*, CONCAT(u.lastname, ' ', u.firstname) as customerName, u.email as customerEmail, u.phone as customerPhone
      FROM tblorder o
      LEFT JOIN tbluser u ON o.userID = u.userID
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (o.orderID LIKE ? OR CONCAT(u.lastname, \' \' , u.firstname) LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (dateFrom && dateTo) {
      query += ' AND o.orderDate BETWEEN ? AND ?';
      params.push(dateFrom, dateTo);
    }

    // Đếm tổng số records
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM (${query}) as t`,
      params
    );
    const total = countResult[0].total;

    // Lấy dữ liệu với phân trang
    query += ' ORDER BY o.orderDate DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [orders] = await db.query(query, params);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  } catch (err) {
    throw err;
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (orderId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Xóa chi tiết đơn hàng trước
    await conn.query('DELETE FROM tblorderdetail WHERE orderID = ?', [orderId]);
    // Xóa đơn hàng
    await conn.query('DELETE FROM tblorder WHERE orderID = ?', [orderId]);
    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};