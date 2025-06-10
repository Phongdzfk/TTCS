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
    const status = customStatus || (paymentMethod === 'cod' ? 'pending' : 'waiting_payment');
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

exports.handleMomoCallback = async (data) => {
  // Xác nhận thanh toán thành công từ MoMo
  if (data.resultCode === 0) {
    // Thành công, cập nhật trạng thái đơn hàng
    await db.query('UPDATE tblorder SET status=? WHERE orderID=?', ['paid', data.orderId]);
  } else {
    // Thất bại hoặc bị hủy
    await db.query('UPDATE tblorder SET status=? WHERE orderID=?', ['cancelled', data.orderId]);
  }
};

exports.createOrderInDb = createOrderInDb;

// Lấy danh sách đơn hàng với bộ lọc
exports.getOrders = async ({ status, search, dateFrom, dateTo, page, limit }) => {
  try {
    let query = `
      SELECT o.*, 
             u.name as customerName, 
             u.email as customerEmail, 
             u.phone as customerPhone
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
      query += ` AND (
        o.orderID LIKE ? OR 
        u.name LIKE ? OR 
        u.email LIKE ? OR 
        u.phone LIKE ?
      )`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (dateFrom) {
      query += ' AND o.orderDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND o.orderDate <= ?';
      params.push(dateTo + ' 23:59:59');
    }

    // Đếm tổng số đơn hàng
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM (${query}) as t`,
      params
    );
    const total = countResult[0].total;

    // Thêm phân trang
    query += ' ORDER BY o.orderDate DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    // Lấy danh sách đơn hàng
    const [orders] = await db.query(query, params);

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT od.*, p.name as productName, p.image as productImage
         FROM tblorderdetail od
         JOIN tblproduct p ON od.productID = p.productID
         WHERE od.orderID = ?`,
        [order.orderID]
      );
      order.items = items;
    }

    return {
      orders,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (err) {
    throw new Error('Lỗi khi lấy danh sách đơn hàng: ' + err.message);
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (orderId) => {
  try {
    // Lấy thông tin đơn hàng
    const [orders] = await db.query(
      `SELECT o.*, 
              u.name as customerName, 
              u.email as customerEmail, 
              u.phone as customerPhone
       FROM tblorder o
       LEFT JOIN tbluser u ON o.userID = u.userID
       WHERE o.orderID = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return null;
    }

    const order = orders[0];

    // Lấy chi tiết sản phẩm
    const [items] = await db.query(
      `SELECT od.*, p.name as productName, p.image as productImage
       FROM tblorderdetail od
       JOIN tblproduct p ON od.productID = p.productID
       WHERE od.orderID = ?`,
      [orderId]
    );
    order.items = items;

    // Lấy lịch sử đơn hàng
    const [history] = await db.query(
      `SELECT * FROM tblorderhistory 
       WHERE orderID = ? 
       ORDER BY timestamp DESC`,
      [orderId]
    );
    order.history = history;

    return order;
  } catch (err) {
    throw new Error('Lỗi khi lấy chi tiết đơn hàng: ' + err.message);
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (orderId, status, note) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Kiểm tra đơn hàng tồn tại
    const [orders] = await conn.query(
      'SELECT status FROM tblorder WHERE orderID = ?',
      [orderId]
    );

    if (orders.length === 0) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    const currentStatus = orders[0].status;

    // Kiểm tra tính hợp lệ của trạng thái mới
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipping', 'cancelled'],
      'shipping': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      throw new Error('Không thể chuyển sang trạng thái này từ trạng thái hiện tại');
    }

    // Cập nhật trạng thái
    await conn.query(
      'UPDATE tblorder SET status = ? WHERE orderID = ?',
      [status, orderId]
    );

    // Thêm vào lịch sử
    await conn.query(
      'INSERT INTO tblorderhistory (orderID, status, note, timestamp) VALUES (?, ?, ?, NOW())',
      [orderId, status, note || `Trạng thái đã được cập nhật thành "${status}"`]
    );

    await conn.commit();

    // Lấy thông tin đơn hàng sau khi cập nhật
    return await this.getOrderDetails(orderId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// Lấy thống kê đơn hàng
exports.getOrderStats = async () => {
  try {
    const [stats] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(totalAmount) as totalAmount
      FROM tblorder
      GROUP BY status
    `);

    return stats;
  } catch (err) {
    throw new Error('Lỗi khi lấy thống kê đơn hàng: ' + err.message);
  }
}; 