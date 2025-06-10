const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/summary', statisticsController.getSummary);
router.get('/revenue-by-time', statisticsController.getRevenueByTime);
router.get('/order-distribution', statisticsController.getOrderDistribution);
router.get('/category-revenue', statisticsController.getCategoryRevenue);
router.get('/brand-revenue', statisticsController.getBrandRevenue);
router.get('/category-stats', statisticsController.getCategoryStats);
router.get('/top-products', statisticsController.getTopProducts);
router.get('/recent-orders', statisticsController.getRecentOrders);

module.exports = router; 