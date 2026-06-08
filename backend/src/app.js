const express = require('express');
const cors = require('cors');

const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const onedriveRoutes = require('./routes/onedrive');
const backupRoutes = require('./routes/backup');
const restoreRoutes = require('./routes/restore');
const logsRoutes = require('./routes/logs');

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/onedrive', onedriveRoutes);
app.use('/backup', backupRoutes);
app.use('/restore', restoreRoutes);
app.use('/logs', logsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
