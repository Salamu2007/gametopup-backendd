import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/order.js';
import chargeRouter from './routes/charge.js';
import adminRoutes from './routes/admin.js';
import dotenv from 'dotenv';
dotenv.config();


const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS with options
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // limit payload size

app.use('/api/products', productRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/charges', chargeRouter);

app.use('/api/admin', adminRoutes);

// خدمة الملفات الثابتة للصور
app.use('/uploads', express.static('uploads'));
app.use('/uploadsCharge', express.static('uploadsCharge'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Removed duplicate mongoose.connect(...) block. connectDB() below handles the connection.

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gametopup';
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`   GET    /api/products/:id`);
  console.log(`\n🛒 Orders (MongoDB):`);
  console.log(`   POST   /api/orders - Create order`);
  console.log(`   GET    /api/orders - Get all orders`);
  console.log(`   GET    /api/orders/:id - Get order by ID`);
  console.log(`   PUT    /api/orders/:id - Update order status`);
  console.log(`   DELETE /api/orders/:id - Delete/Cancel order`);
  console.log(`\n💰 Charges (TopUp):`);
  console.log(`   POST   /api/charges`);
  console.log(`   GET    /api/charges`);
  console.log(`   GET    /api/charges/:id`);
  console.log(`   PUT    /api/charges/:id`);
});
