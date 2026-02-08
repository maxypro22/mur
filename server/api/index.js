const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/auth', require('../routes/authRoutes'));
app.use('/cases', require('../routes/caseRoutes'));
app.use('/finance', require('../routes/financeRoutes'));
app.use('/users', require('../routes/userRoutes'));
app.use('/dashboard', require('../routes/dashboardRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Al Murqab API is running...');
});

const PORT = process.env.PORT || 5000;

module.exports = app;
