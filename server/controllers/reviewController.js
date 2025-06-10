const reviewService = require('../services/reviewService');

exports.getReviewsByProduct = async (req, res) => {
  try {
    const productID = req.params.productID;
    const reviews = await reviewService.getReviewsByProduct(productID);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { productID, rating, comment } = req.body;
    const review = await reviewService.addReview({ productID, userID, rating, comment });
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const userID = req.user.userID;
    const roleID = req.user.roleID;
    const reviewID = req.params.reviewID;
    await reviewService.deleteReview(reviewID, userID, roleID);
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const userID = req.user.userID;
    const reviewID = req.params.reviewID;
    const { rating, comment } = req.body;
    const review = await reviewService.updateReview(reviewID, userID, rating, comment);
    res.json({ review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 