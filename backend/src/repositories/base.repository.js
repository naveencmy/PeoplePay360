const { query, getClient, withTransaction } = require('../config/database');
const { v7: uuidv7 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────────────
// Base Repository — generic CRUD operations for all entities
// Provides parameterized queries, pagination, and transaction support
// ─────────────────────────────────────────────────────────────────────────────

class BaseRepository {
  /**
   * @param {string} tableName - Database table name
   * @param {string[]} [columns] - Column names for insert/update validation
   */
  constructor(tableName, columns = []) {
    this.tableName = tableName;
    this.columns = columns;
  }

  /**
   * Generate a new UUID v7 (time-sortable)
   * @returns {string}
   */
  generateId() {
    return uuidv7();
  }

  /**
   * Find a record by ID
   * @param {string} id
   * @param {import('pg').PoolClient} [client] - Optional client for transactions
   * @returns {Promise<Object|null>}
   */
  async findById(id, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const result = await exec(
      `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all records with optional filters, pagination, and sorting
   * @param {Object} options
   * @param {Object} [options.where] - Key-value pairs for WHERE conditions
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy='created_at'] - Sort column
   * @param {string} [options.sortOrder='desc'] - Sort direction
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<{ rows: Object[], total: number }>}
   */
  async findAll({ where = {}, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = {}, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Whitelist sort columns to prevent SQL injection
    const allowedSortColumns = [...this.columns, 'created_at', 'updated_at', 'id'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const [dataResult, countResult] = await Promise.all([
      exec(
        `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY ${safeSortBy} ${safeSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...values, limit, offset]
      ),
      exec(
        `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`,
        values
      ),
    ]);

    return {
      rows: dataResult.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Create a new record
   * @param {Object} data - Key-value pairs to insert
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<Object>} Created record
   */
  async create(data, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const id = data.id || this.generateId();
    const dataWithId = { id, ...data };

    const keys = Object.keys(dataWithId);
    const values = Object.values(dataWithId);
    const placeholders = keys.map((_, i) => `$${i + 1}`);

    const result = await exec(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Update a record by ID
   * @param {string} id
   * @param {Object} data - Key-value pairs to update
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<Object|null>} Updated record
   */
  async update(id, data, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const entries = Object.entries(data).filter(([key]) => key !== 'id');

    if (entries.length === 0) return this.findById(id, client);

    const setClauses = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    values.push(id);

    const result = await exec(
      `UPDATE ${this.tableName} SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${values.length} AND deleted_at IS NULL RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Soft delete a record by ID
   * @param {string} id
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<boolean>}
   */
  async delete(id, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const result = await exec(
      `UPDATE ${this.tableName} SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Hard delete a record (use sparingly)
   * @param {string} id
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<boolean>}
   */
  async hardDelete(id, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const result = await exec(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Count records matching conditions
   * @param {Object} [where] - Key-value pairs for WHERE conditions
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<number>}
   */
  async count(where = {}, client = null) {
    const exec = client ? client.query.bind(client) : query;
    const conditions = ['deleted_at IS NULL'];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(where)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const result = await exec(
      `SELECT COUNT(*) AS total FROM ${this.tableName} ${whereClause}`,
      values
    );

    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Check if a record exists
   * @param {Object} where - Key-value pairs for WHERE conditions
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<boolean>}
   */
  async exists(where = {}, client = null) {
    const count = await this.count(where, client);
    return count > 0;
  }

  /**
   * Execute a raw query
   * @param {string} text - SQL query
   * @param {Array} params - Parameters
   * @param {import('pg').PoolClient} [client]
   * @returns {Promise<import('pg').QueryResult>}
   */
  async raw(text, params = [], client = null) {
    const exec = client ? client.query.bind(client) : query;
    return exec(text, params);
  }

  /**
   * Execute within a transaction
   * @param {Function} fn - Async function receiving the client
   * @returns {Promise<*>}
   */
  async transaction(fn) {
    return withTransaction(fn);
  }
}

module.exports = BaseRepository;
