const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MachineCare API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
