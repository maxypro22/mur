const express = require('express');
const apiApp = require('./api/index.js');
const localApp = express();

// Mount the API on /api to match local dev expectations
localApp.use('/api', apiApp);

const PORT = process.env.PORT || 5000;
localApp.listen(PORT, () => {
  console.log(`🚀 Local Development Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints mapped to http://localhost:${PORT}/api/*`);
});
