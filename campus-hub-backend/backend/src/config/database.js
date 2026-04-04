const { Pool } = require('pg');
const env = require('./env');

if (!env.databaseUrl) {
  console.warn('[database] DATABASE_URL is not set. Queries will fail until it is configured.');
}

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('[database] Unexpected error on idle client', err);
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('[sql]', { text, duration, rows: result.rowCount });
  }
  return result;
}

module.exports = {
  pool,
  query
};
