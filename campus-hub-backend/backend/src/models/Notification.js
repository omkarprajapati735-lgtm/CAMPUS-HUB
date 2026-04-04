const { query } = require('../config/database');

class Notification {
  static async create({ userId, title, message, type = 'info', metadata = {} }) {
    const { rows } = await query(
      `INSERT INTO notifications (user_id, title, message, type, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, title, message, type, metadata, is_read, created_at`,
      [userId, title, message, type, metadata]
    );
    return rows[0];
  }

  static async listByUser(userId, { limit = 20, offset = 0 } = {}) {
    const { rows } = await query(
      `SELECT id, user_id, title, message, type, metadata, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async markRead(notificationId, userId) {
    const { rows } = await query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, title, message, type, metadata, is_read, created_at`,
      [notificationId, userId]
    );
    return rows[0] || null;
  }
}

module.exports = Notification;
