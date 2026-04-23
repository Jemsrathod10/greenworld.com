const express = require('express');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

// Import DB & Routes
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products'); 
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');
const statsRoutes = require('./routes/stats');
const contactRoutes = require('./routes/contactRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();

// Database Connection
connectDB();

// ✅ UPDATED MIDDLEWARE: Better CORS configuration for mobile sync
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins (mobile IP, localhost, etc.) in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/cart', cartRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;

// Server Listen
app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';

  for (const key in networkInterfaces) {
    for (const iface of networkInterfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }

  console.log('-------------------------------------------');
  console.log('🚀 Server is running');
  console.log(`🏠 Local:    http://localhost:${PORT}`);
  console.log(`🌐 Network:  http://${localIP}:${PORT}`);
  console.log('-------------------------------------------');
});