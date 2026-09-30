const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MachineCare API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
