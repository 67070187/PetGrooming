const express = require('express');
const cors = require('cors');
const api = require('./api');
const { errorHandler } = require('./api/middleware');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api', api);
app.use(errorHandler);

module.exports = app;
