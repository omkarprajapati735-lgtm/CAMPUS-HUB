const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { query } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campusRoutes = require('./routes/campusRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { startScheduledTasks } = require('./jobs/scheduledTasks');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/api/health', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT NOW() AS server_time');
    res.json({
      status: 'ok',
      service: 'campus-hub-backend',
      serverTime: rows[0].server_time
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campuses', campusRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  startScheduledTasks();
}

const server = app.listen(env.port, () => {
  console.log(`Campus Hub backend running on port ${env.port}`);
});

module.exports = { app, server };
