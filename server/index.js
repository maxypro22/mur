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

// Database Connection with Serverless Optimization
let cachedPromise = null;

const connectDB = async () => {
  // Force new connection if not connected
  if (mongoose.connection.readyState !== 1) {
    try {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 45000,
        family: 4
      };

      await mongoose.connect(process.env.MONGODB_URI, opts);
      console.log('✅ New MongoDB Connection Established');
      return mongoose.connection;
    } catch (error) {
      console.error('❌ MongoDB Connection Error:', error);
      throw error;
    }
  }

  return mongoose.connection;
};

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

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Export for Vercel
module.exports = app;
