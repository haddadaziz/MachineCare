const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const machineRoutes = require('./routes/machineRoutes');
const breakdownRoutes = require('./routes/breakdownRoutes');

const AppError = require('./utils/AppError');
const { globalErrorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/breakdowns', breakdownRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'MachineCare API is running smoothly',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} introuvable sur cette API`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
