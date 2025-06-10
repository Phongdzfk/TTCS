const db = require('../config/db');

exports.getCart = async (userId) => {
  // Lấy cartID của user
  const [carts] = await db.query('SELECT * FROM tblcart WHERE userID = ?', [userId]);
  let cartID;
  if (carts.length === 0) {
    // Nếu chưa có cart, tạo mới
    const [result] = await db.query('INSERT INTO tblcart (userID, createdAt) VALUES (?, NOW())', [userId]);
    cartID = result.insertId;
  } else {
    cartID = carts[0].cartID;
  }
  // Lấy các item trong cart
  const [items] = await db.query(
    `SELECT cd.productID as productId, p.name, p.price, cd.quantity,
      (SELECT imageUrl FROM tblproductimage WHERE productID = p.productID LIMIT 1) as image, p.description,
      d.discountID, d.value as discountValue, d.startDate as discountStart, d.endDate as discountEnd, d.description as discountDescription, d.name as discountName
     FROM tblcartdetail cd
     JOIN tblproduct p ON cd.productID = p.productID
     LEFT JOIN tblProductDiscount pd ON p.productID = pd.productID
     LEFT JOIN tblDiscount d ON pd.discountID = d.discountID AND d.endDate >= CURDATE()
     WHERE cd.cartID = ?` , [cartID]);
  return items.map(item => ({
    ...item,
    discount: item.discountID ? {
      discountID: item.discountID,
      value: item.discountValue,
      startDate: item.discountStart,
      endDate: item.discountEnd,
      description: item.discountDescription,
      name: item.discountName
    } : null
  }));
};

exports.addToCart = async (userId, productId, quantity) => {
  // Lấy cartID
  const [carts] = await db.query('SELECT * FROM tblcart WHERE userID = ?', [userId]);
  let cartID;
  if (carts.length === 0) {
    const [result] = await db.query('INSERT INTO tblcart (userID, createdAt) VALUES (?, NOW())', [userId]);
    cartID = result.insertId;
  } else {
    cartID = carts[0].cartID;
  }

  // Kiểm tra số lượng tồn kho
  const [products] = await db.query('SELECT stockQuantity FROM tblproduct WHERE productID = ?', [productId]);
  if (products.length === 0) {
    throw new Error('Sản phẩm không tồn tại');
  }
  const stockQuantity = products[0].stockQuantity;

  // Kiểm tra sản phẩm đã có trong cart chưa
  const [items] = await db.query('SELECT * FROM tblcartdetail WHERE cartID = ? AND productID = ?', [cartID, productId]);
  if (items.length > 0) {
    // Kiểm tra tổng số lượng sau khi thêm
    const newQuantity = items[0].quantity + quantity;
    if (newQuantity > stockQuantity) {
      throw new Error('Số lượng sản phẩm trong giỏ hàng vượt quá số lượng tồn kho');
    }
    // Nếu có rồi thì tăng số lượng
    await db.query('UPDATE tblcartdetail SET quantity = quantity + ? WHERE cartID = ? AND productID = ?', [quantity, cartID, productId]);
  } else {
    if (quantity > stockQuantity) {
      throw new Error('Số lượng sản phẩm vượt quá số lượng tồn kho');
    }
    await db.query('INSERT INTO tblcartdetail (cartID, productID, quantity) VALUES (?, ?, ?)', [cartID, productId, quantity]);
  }
  return await exports.getCart(userId);
};

exports.updateCartItem = async (userId, productId, quantity) => {
  const [carts] = await db.query('SELECT * FROM tblcart WHERE userID = ?', [userId]);
  if (carts.length === 0) throw new Error('Cart not found');
  const cartID = carts[0].cartID;

  // Kiểm tra số lượng tồn kho
  const [products] = await db.query('SELECT stockQuantity FROM tblproduct WHERE productID = ?', [productId]);
  if (products.length === 0) {
    throw new Error('Sản phẩm không tồn tại');
  }
  const stockQuantity = products[0].stockQuantity;

  if (quantity > stockQuantity) {
    throw new Error('Số lượng sản phẩm vượt quá số lượng tồn kho');
  }

  await db.query('UPDATE tblcartdetail SET quantity = ? WHERE cartID = ? AND productID = ?', [quantity, cartID, productId]);
  return await exports.getCart(userId);
};

exports.removeCartItem = async (userId, productId) => {
  const [carts] = await db.query('SELECT * FROM tblcart WHERE userID = ?', [userId]);
  if (carts.length === 0) throw new Error('Cart not found');
  const cartID = carts[0].cartID;
  await db.query('DELETE FROM tblcartdetail WHERE cartID = ? AND productID = ?', [cartID, productId]);
  return await exports.getCart(userId);
};

exports.clearCart = async (userId) => {
  const [carts] = await db.query('SELECT * FROM tblcart WHERE userID = ?', [userId]);
  if (carts.length === 0) return;
  const cartID = carts[0].cartID;
  await db.query('DELETE FROM tblcartdetail WHERE cartID = ?', [cartID]);
}; 