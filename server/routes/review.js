const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../controllers/authController');

router.get('/:productID', reviewController.getReviewsByProduct);
router.post('/', authenticateToken, reviewController.addReview);
router.delete('/:reviewID', authenticateToken, reviewController.deleteReview);
router.put('/:reviewID', authenticateToken, reviewController.updateReview);

module.exports = router; 