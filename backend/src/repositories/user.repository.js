const BaseRepository = require('./base.repository');

// ─────────────────────────────────────────────────────────────────────────────
// User Repository — auth-specific queries
// ─────────────────────────────────────────────────────────────────────────────

class UserRepository extends BaseRepository {
  constructor() {
    super('users', ['email', 'password_hash', 'role', 'first_name', 'last_name', 'employee_id', 'is_active']);
  }

  async findByEmail(email) {
    const result = await this.raw(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email.toLowerCase()]
    );
    return result.rows[0] || null;
  }

  async updateRefreshToken(userId, refreshToken) {
    return this.update(userId, { refresh_token: refreshToken });
  }

  async clearRefreshToken(userId) {
    return this.update(userId, { refresh_token: null });
  }
}

module.exports = new UserRepository();
