const scheduleRepo = require('../repositories/schedule.repository');
const { sendSuccess, sendCreated } = require('../utils/response.utils');
const { AppError } = require('../middleware/error.middleware');

async function listSchedules(req, res) {
  const schedules = await scheduleRepo.listAll();
  // Map fields for frontend compatibility
  const mapped = schedules.map(s => ({
    id: s.id,
    name: s.name,
    daysPerWeek: s.days_per_week,
    hoursPerWeek: parseFloat(s.hours_per_week),
    grid: s.grid || [],
    status: s.status || 'Active',
    company: s.company || 'PeoplePay360 Global',
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }));
  sendSuccess(res, mapped);
}

async function getSchedule(req, res) {
  const schedule = await scheduleRepo.findById(req.params.id);
  if (!schedule) {
    throw AppError.notFound('Schedule not found');
  }
  sendSuccess(res, {
    id: schedule.id,
    name: schedule.name,
    daysPerWeek: schedule.days_per_week,
    hoursPerWeek: parseFloat(schedule.hours_per_week),
    grid: schedule.grid || [],
    status: schedule.status || 'Active',
    company: schedule.company || 'PeoplePay360 Global',
    createdAt: schedule.created_at,
    updatedAt: schedule.updated_at,
  });
}

async function createSchedule(req, res) {
  const { name, grid, totalHours, daysPerWeek } = req.body;
  if (!name) {
    throw AppError.badRequest('Schedule name is required');
  }
  const days = daysPerWeek || (Array.isArray(grid) ? grid.filter(g => g.active).length : 5);
  const hours = totalHours || (Array.isArray(grid) ? grid.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 8), 0) : 40);

  const created = await scheduleRepo.create({
    name,
    days_per_week: days,
    hours_per_week: hours,
    grid: JSON.stringify(grid || []),
    status: 'Active',
    company: 'PeoplePay360 Global',
  });

  sendCreated(res, created, 'Working schedule created successfully');
}

async function updateSchedule(req, res) {
  const { id } = req.params;
  const updateData = {};
  if (req.body.name) updateData.name = req.body.name;
  if (req.body.daysPerWeek) updateData.days_per_week = req.body.daysPerWeek;
  if (req.body.hoursPerWeek) updateData.hours_per_week = req.body.hoursPerWeek;
  if (req.body.grid) updateData.grid = JSON.stringify(req.body.grid);
  if (req.body.status) updateData.status = req.body.status;

  const updated = await scheduleRepo.update(id, updateData);
  sendSuccess(res, updated, 'Working schedule updated successfully');
}

module.exports = { listSchedules, getSchedule, createSchedule, updateSchedule };
