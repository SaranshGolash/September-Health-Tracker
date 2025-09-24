// PostgreSQL-backed model helpers for "entries" table.
// These functions expect a 'pool' (node-postgres Pool) instance as the first argument.

const TABLE_NAME = 'entries';

module.exports = {
  // Ensure the table exists. Call this once at app startup.
  async init(pool) {
    const createSql = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        entry TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await pool.query(createSql);
  },

  // Create a new entry. Returns the inserted row.
  async create(pool, entryText) {
    if (!entryText || typeof entryText !== 'string') {
      throw new Error('Invalid entry text');
    }
    const sql = `INSERT INTO ${TABLE_NAME} (entry) VALUES ($1) RETURNING *`;
    const { rows } = await pool.query(sql, [entryText.trim()]);
    return rows[0];
  },

  // Get paginated entries (most recent first).
  async getAll(pool, { limit = 100, offset = 0 } = {}) {
    const sql = `SELECT * FROM ${TABLE_NAME} ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
    const { rows } = await pool.query(sql, [Number(limit), Number(offset)]);
    return rows;
  },

  // Get single entry by id
  async getById(pool, id) {
    const sql = `SELECT * FROM ${TABLE_NAME} WHERE id = $1`;
    const { rows } = await pool.query(sql, [id]);
    return rows[0] || null;
  },

  // Update an entry text by id. Returns the updated row.
  async update(pool, id, entryText) {
    if (!entryText || typeof entryText !== 'string') {
      throw new Error('Invalid entry text');
    }
    const sql = `UPDATE ${TABLE_NAME} SET entry = $1 WHERE id = $2 RETURNING *`;
    const { rows } = await pool.query(sql, [entryText.trim(), id]);
    return rows[0] || null;
  },

  // Delete an entry by id. Returns true if deleted.
  async remove(pool, id) {
    const sql = `DELETE FROM ${TABLE_NAME} WHERE id = $1`;
    const result = await pool.query(sql, [id]);
    return result.rowCount > 0;
  }
};