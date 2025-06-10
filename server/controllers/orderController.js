const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const result = await orderService.createOrder(req.body, req.user.userID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.handleMomoCallback = async (req, res) => {
  try {
    await orderService.handleMomoCallback(req.body);
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const userID = req.user.userID;
    const orderID = await orderService.createOrderInDb(req.body, userID);
    res.json({ success: true, orderID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách đơn hàng
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, dateFrom, dateTo } = req.query;
    const result = await orderService.getOrders({
      userID: req.user.userID,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      dateFrom,
      dateTo
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrderDetails(orderId, req.user.userID);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const result = await orderService.updateOrderStatus(orderId, status, req.user.userID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await orderService.cancelOrder(orderId, req.user.userID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả đơn hàng cho admin
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, dateFrom, dateTo } = req.query;
    const result = await orderService.getAllOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      dateFrom,
      dateTo
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await orderService.deleteOrder(orderId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 