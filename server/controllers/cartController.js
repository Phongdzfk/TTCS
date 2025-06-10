const cartService = require('../services/cartService');

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userID;
    const cart = await cartService.getCart(userId);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId, quantity } = req.body;
    const cart = await cartService.updateCartItem(userId, productId, quantity);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userID;
    const { productId } = req.params;
    const cart = await cartService.removeCartItem(userId, productId);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userID;
    await cartService.clearCart(userId);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 