const statisticsService = require('../services/statisticsService');

exports.getSummary = async (req, res) => {
  try {
    const data = await statisticsService.getSummary(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRevenueByTime = async (req, res) => {
  try {
    const data = await statisticsService.getRevenueByTime(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderDistribution = async (req, res) => {
  try {
    const data = await statisticsService.getOrderDistribution(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryRevenue = async (req, res) => {
  try {
    const data = await statisticsService.getCategoryRevenue(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBrandRevenue = async (req, res) => {
  try {
    const data = await statisticsService.getBrandRevenue(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryStats = async (req, res) => {
  try {
    const data = await statisticsService.getCategoryStats(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const data = await statisticsService.getTopProducts(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const data = await statisticsService.getRecentOrders(req.query.period);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 