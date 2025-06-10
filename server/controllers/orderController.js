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