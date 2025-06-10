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