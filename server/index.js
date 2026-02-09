const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration - Allow your Vercel frontend
// CORS Configuration - Simplify for debugging
// Allow all origins to fix connection issues
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// 1. Global Mongoose Settings - Disable buffering to prevent "Operation timed out"
mongoose.set('bufferCommands', false);
mongoose.set('serverSelectionTimeoutMS', 5000);

// 2. Optimized Database Connection for Serverless (Vercel)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    console.log('📡 Connecting to MongoDB...');
    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB Connected');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

// 3. Global Middleware - Ensure DB is connected BEFORE any route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('🔥 DB Connection Error:', err.message);
    res.status(503).json({ error: 'قاعدة البيانات غير متوفرة حالياً' });
  }
});

// Health Check Route - THIS MUST BE FIRST
app.get('/', async (req, res) => {
  let dbStatus = 'Disconnected';
  let dbError = null;
  let connectionDetails = {};

  try {
    await connectDB();
    dbStatus = '✅ Connected Successfully';
    connectionDetails = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (err) {
    dbStatus = '❌ Connection Failed';
    dbError = err.message;
  }

  res.status(200).json({
    status: 'DONE OK ✅',
    message: '🚀 Al Murqab Legal SaaS API - Fully Operational',
    database: {
      status: dbStatus,
      error: dbError,
      details: connectionDetails
    },
    environment: {
      mongoUri: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
      jwtSecret: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
      nodeEnv: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION || 'local'
  });
});

// 4. Global Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('🔥 Global DB Connection Failure:', err);
    res.status(503).json({
      error: 'خدمة قاعدة البيانات غير متوفرة حالياً',
      details: err.message
    });
  }
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Export for Vercel
module.exports = app;
