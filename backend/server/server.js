const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const adminMiddleware = require('./middleware/adminMiddleware');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminOrderRoutes = require('./routes/admin/orderRoutes');
const adminProductRoutes = require('./routes/admin/productRoutes');
const adminCouponRoutes = require('./routes/admin/couponRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ charset: 'utf-8' }));
app.use(bodyParser.urlencoded({ extended: true, charset: 'utf-8' }));

// Set default charset cho response
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static files từ thư mục asset (cho ảnh sản phẩm)
app.use('/asset', express.static(path.join(__dirname, '../../frontend/client/asset')));

// Test Route
app.get('/', (req, res) => {
    res.send('Anh Men Store API is running...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});