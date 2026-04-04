const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

class User {
  static async create({ fullName, email, password, role = 'student', avatarUrl = null }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, role, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, avatar_url, created_at, updated_at`,
      [fullName, email.toLowerCase(), passwordHash, role, avatarUrl]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const { rows } = await query(
      `SELECT id, full_name, email, password_hash, role, avatar_url, created_at, updated_at
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await query(
      `SELECT id, full_name, email, role, avatar_url, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, updates) {
    const allowed = ['fullName', 'avatarUrl', 'role'];
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.fullName);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(updates.avatarUrl);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(updates.role);
    }
    if (!fields.length) return this.findById(id);

    values.push(id);
    const { rows } = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING id, full_name, email, role, avatar_url, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User;
