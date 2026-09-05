const BaseRepository = require('./base.repository');

class ScheduleRepository extends BaseRepository {
  constructor() {
    super('working_schedules', [
      'name',
      'days_per_week',
      'hours_per_week',
      'grid',
      'status',
      'company',
    ]);
  }

  async listAll() {
    const result = await this.raw(
      `SELECT * FROM working_schedules WHERE deleted_at IS NULL ORDER BY created_at ASC`
    );
    return result.rows;
  }
}

module.exports = new ScheduleRepository();
