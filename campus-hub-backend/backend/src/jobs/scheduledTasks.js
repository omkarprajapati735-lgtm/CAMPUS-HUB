const cron = require('node-cron');
const { query } = require('../config/database');

function startScheduledTasks() {
  // Every day at 1:00 AM server time, keep notifications table tidy.
  cron.schedule('0 1 * * *', async () => {
    try {
      await query(`DELETE FROM notifications WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '90 days'`);
      console.log('[cron] Archived old read notifications');
    } catch (error) {
      console.error('[cron] Failed to run maintenance job', error);
    }
  });
}

module.exports = {
  startScheduledTasks
};
