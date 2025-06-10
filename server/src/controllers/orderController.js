const orderService = require('../services/orderService');

exports.createOrder = async (req, res) => {
  try {
    const result = await orderService.createOrder(req.body, req.user ? req.user.userID : null);
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
    const userID = req.user ? req.user.userID : null;
    const orderID = await require('../services/orderService').createOrderInDb(req.body, userID);
    res.json({ success: true, orderID });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách đơn hàng với bộ lọc
exports.getOrders = async (req, res) => {
  try {
    const {
      status,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10
    } = req.query;

    const result = await orderService.getOrders({
      status,
      search,
      dateFrom,
      dateTo,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await orderService.getOrderDetails(req.params.id);
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
    const { status, note } = req.body;
    const result = await orderService.updateOrderStatus(req.params.id, status, note);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy thống kê đơn hàng
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await orderService.getOrderStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 