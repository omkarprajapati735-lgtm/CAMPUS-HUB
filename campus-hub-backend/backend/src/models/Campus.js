const { query } = require('../config/database');

class Campus {
  static async list({ limit = 20, offset = 0, search = '' } = {}) {
    const params = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE name ILIKE $1 OR location ILIKE $1 OR description ILIKE $1`;
    }
    params.push(limit, offset);

    const { rows } = await query(
      `SELECT id, name, location, description, banner_url, created_at, updated_at
       FROM campuses
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await query(
      `SELECT id, name, location, description, banner_url, created_at, updated_at
       FROM campuses
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, location, description = null, bannerUrl = null }) {
    const { rows } = await query(
      `INSERT INTO campuses (name, location, description, banner_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, location, description, banner_url, created_at, updated_at`,
      [name, location, description, bannerUrl]
    );
    return rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.location !== undefined) {
      fields.push(`location = $${idx++}`);
      values.push(updates.location);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.bannerUrl !== undefined) {
      fields.push(`banner_url = $${idx++}`);
      values.push(updates.bannerUrl);
    }
    if (!fields.length) return this.findById(id);

    values.push(id);
    const { rows } = await query(
      `UPDATE campuses SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING id, name, location, description, banner_url, created_at, updated_at`,
      values
    );
    return rows[0] || null;
  }

  static async remove(id) {
    await query(`DELETE FROM campuses WHERE id = $1`, [id]);
    return true;
  }
}

module.exports = Campus;
