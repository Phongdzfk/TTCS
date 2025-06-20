require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const productRouter = require('./routes/product');
const categoryRoutes = require('./routes/category');
const userRoutes = require('./routes/user');
const discountRoutes = require('./routes/discount');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const reviewRoutes = require('./routes/review');
const statisticsRoutes = require('./routes/statistics');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // hoặc thay bằng domain FE nếu muốn
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors());

app.get('/', (req, res) => {
  res.send('TTCS Server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/statistics', statisticsRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Kiểm tra kết nối MySQL
(async () => {
  try {
    await db.getConnection();
    console.log('Kết nối MySQL thành công!');
  } catch (err) {
    console.error('Lỗi kết nối MySQL:', err.message);
  }
})();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
