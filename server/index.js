require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const userRoutes = require('./routes/user');
const discountRoutes = require('./routes/discount');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
  res.send('TTCS Server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/discounts', discountRoutes);

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
