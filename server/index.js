const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(morgan('dev'));

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Database Connection - Mirroring Working Reference Pattern
let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedPromise) {
    // Use MONGO_URI (from reference) or MONGODB_URI (current)
    const dbUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!dbUri) {
      console.error('🔥 CRITICAL: Database URI is missing!');
      throw new Error('Database URI missing');
    }

    console.log('📡 Connecting to MongoDB (Reference Pattern)...');
    cachedPromise = mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 5000
      // Defaulting back to standard Mongoose buffering for stability
    }).catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
      cachedPromise = null; // Allow retry on next request
      throw err;
    });
  }

  return cachedPromise;
};

// Global Middleware - Ensure DB and Headers
app.use(async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('🔥 Request Blocked - DB Failure:', err.message);
    res.status(503).json({ error: 'قاعدة البيانات غير متوفرة', details: err.message });
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Export for Vercel
module.exports = app;
