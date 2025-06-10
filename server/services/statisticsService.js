const db = require('../config/db');

exports.getSummary = async (period) => {
  let dateFilter = '';
  if (period === 'today') dateFilter = 'AND DATE(orderDate) = CURDATE()';
  else if (period === 'month') dateFilter = 'AND MONTH(orderDate) = MONTH(CURDATE()) AND YEAR(orderDate) = YEAR(CURDATE())';
  else if (period === 'week') dateFilter = 'AND YEARWEEK(orderDate, 1) = YEARWEEK(CURDATE(), 1)';
  else if (period === 'year') dateFilter = 'AND YEAR(orderDate) = YEAR(CURDATE())';

  const [[{ totalRevenue }]] = await db.query(`SELECT SUM(totalAmount) as totalRevenue FROM tblorder WHERE status = 'completed' ${dateFilter}`);
  const [[{ totalOrders }]] = await db.query(`SELECT COUNT(*) as totalOrders FROM tblorder WHERE 1=1 ${dateFilter}`);
  const conversionRate = totalOrders ? (totalOrders / totalOrders * 100).toFixed(2) : 0;

  return {
    totalRevenue: totalRevenue || 0,
    totalOrders: totalOrders || 0,
    conversionRate
  };
};

exports.getRevenueByTime = async (period) => {
  const [rows] = await db.query(`
    SELECT DATE(orderDate) as date, SUM(totalAmount) as revenue
    FROM tblorder
    WHERE status = 'completed'
    GROUP BY DATE(orderDate)
    ORDER BY DATE(orderDate) DESC
    LIMIT 7
  `);
  return {
    labels: rows.map(r => r.date),
    data: rows.map(r => r.revenue)
  };
};

exports.getOrderDistribution = async (period) => {
  const [rows] = await db.query(`
    SELECT status, COUNT(*) as count
    FROM tblorder
    GROUP BY status
  `);
  return {
    labels: rows.map(r => r.status),
    data: rows.map(r => r.count)
  };
};

exports.getCategoryRevenue = async (period) => {
  let dateFilter = '';
  if (period === 'today') dateFilter = 'AND DATE(o.orderDate) = CURDATE()';
  else if (period === 'month') dateFilter = 'AND MONTH(o.orderDate) = MONTH(CURDATE()) AND YEAR(o.orderDate) = YEAR(CURDATE())';
  else if (period === 'week') dateFilter = 'AND YEARWEEK(o.orderDate, 1) = YEARWEEK(CURDATE(), 1)';
  else if (period === 'year') dateFilter = 'AND YEAR(o.orderDate) = YEAR(CURDATE())';

  const [rows] = await db.query(`
    SELECT 
      c.name as category,
      COUNT(DISTINCT o.orderID) as totalOrders,
      SUM(od.quantity) as totalQuantity,
      SUM(od.quantity * od.price) as revenue
    FROM tblorder o
    JOIN tblorderdetail od ON o.orderID = od.orderID
    JOIN tblproduct p ON od.productID = p.productID
    JOIN tblcategory c ON p.categoryID = c.categoryID
    WHERE o.status = 'completed'
    ${dateFilter}
    GROUP BY c.categoryID, c.name
    ORDER BY revenue DESC
  `);

  return {
    labels: rows.map(r => r.category),
    data: rows.map(r => r.revenue),
    details: rows.map(r => ({
      category: r.category,
      totalOrders: r.totalOrders,
      totalQuantity: r.totalQuantity,
      revenue: r.revenue
    }))
  };
};

exports.getBrandRevenue = async (period) => {
  let dateFilter = '';
  if (period === 'today') dateFilter = 'AND DATE(o.orderDate) = CURDATE()';
  else if (period === 'month') dateFilter = 'AND MONTH(o.orderDate) = MONTH(CURDATE()) AND YEAR(o.orderDate) = YEAR(CURDATE())';
  else if (period === 'week') dateFilter = 'AND YEARWEEK(o.orderDate, 1) = YEARWEEK(CURDATE(), 1)';
  else if (period === 'year') dateFilter = 'AND YEAR(o.orderDate) = YEAR(CURDATE())';

  const [rows] = await db.query(`
    SELECT 
      pa.attValue as brand,
      COUNT(DISTINCT o.orderID) as totalOrders,
      SUM(od.quantity) as totalQuantity,
      SUM(od.quantity * od.price) as revenue
    FROM tblorder o
    JOIN tblorderdetail od ON o.orderID = od.orderID
    JOIN tblproduct p ON od.productID = p.productID
    JOIN tblproductatt pa ON p.productID = pa.productID
    WHERE o.status = 'completed'
    AND pa.attName = 'Hãng'
    ${dateFilter}
    GROUP BY pa.attValue
    ORDER BY revenue DESC
  `);

  return {
    labels: rows.map(r => r.brand),
    data: rows.map(r => r.revenue),
    details: rows.map(r => ({
      brand: r.brand,
      totalOrders: r.totalOrders,
      totalQuantity: r.totalQuantity,
      revenue: r.revenue
    }))
  };
};

exports.getCategoryStats = async (period) => {
  const [rows] = await db.query(`
    SELECT c.name as name, SUM(od.quantity) as sold, SUM(od.price * od.quantity) as revenue, 0 as growth, 0 as profit
    FROM tblorderdetail od
    JOIN tblorder o ON od.orderID = o.orderID
    JOIN tblproduct p ON od.productID = p.productID
    JOIN tblcategory c ON p.categoryID = c.categoryID
    WHERE o.status = 'completed'
    GROUP BY c.categoryID
  `);
  return rows;
};

exports.getTopProducts = async (period) => {
  const [rows] = await db.query(`
    SELECT p.productID as id, p.name, SUM(od.quantity) as sold, SUM(od.price * od.quantity) as revenue,
      (SELECT imageUrl FROM tblproductimage WHERE productID = p.productID LIMIT 1) as image
    FROM tblorderdetail od
    JOIN tblorder o ON od.orderID = o.orderID
    JOIN tblproduct p ON od.productID = p.productID
    WHERE o.status = 'completed'
    GROUP BY p.productID
    ORDER BY sold DESC
    LIMIT 5
  `);
  return rows;
};

exports.getRecentOrders = async (period) => {
  const [rows] = await db.query(`
    SELECT o.orderID as id, CONCAT(u.lastname, ' ', u.firstname) as customer, o.totalAmount as total, o.status
    FROM tblorder o
    JOIN tbluser u ON o.userID = u.userID
    ORDER BY o.orderDate DESC
    LIMIT 10
  `);
  return rows;
}; 