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
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
// Note: the admin dashboard polls frequently; increase rate limit to avoid triggering 429 errors.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS with options
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const normalizeOrigin = (url) => url.replace(/\/$/, '');

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow non-browser requests (curl, Postman, etc.)

  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedAllowed = corsOrigins.map(normalizeOrigin);

  // Exact match
  if (normalizedAllowed.includes(normalizedOrigin)) return true;

  // Allow wildcard origins like `https://example.com/*`
  for (const allowed of normalizedAllowed) {
    if (allowed.endsWith('*')) {
      const cleanedAllowed = allowed.slice(0, -1); // remove the '*'
      // Accept both with/without trailing slash
      if (normalizedOrigin === cleanedAllowed.replace(/\/$/, '')) return true;
      if (normalizedOrigin.startsWith(cleanedAllowed)) return true;
    }
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const msg = `CORS policy: Origin ${origin} is not allowed.`;
    return callback(new Error(msg), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

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
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MongoDB URI is not set (process.env.MONGODB_URI). Please configure it in your Render/hosting environment.');
    process.exit(1);
  }

  try {
    // Better timeout handling for cloud deployments
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Ensure your MongoDB URI is correct and the database is reachable.');
    process.exit(1);
  }
};

connectDB();


const PORT = process.env.PORT || 3000;
const baseServerUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`Server is running on ${baseServerUrl}`);
});
