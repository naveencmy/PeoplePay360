// ─────────────────────────────────────────────────────────────────────────────
// Response Utilities — standardized API response format
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a successful response
 * @param {import('express').Response} res
 * @param {*} data - Response data
 * @param {string} [message] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @param {Object} [pagination] - Pagination metadata
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200, pagination = null) {
  const response = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 */
function sendCreated(res, data, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send a no-content response (204)
 */
function sendNoContent(res) {
  return res.status(204).send();
}

/**
 * Build pagination metadata
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
function buildPagination(page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = { sendSuccess, sendCreated, sendNoContent, buildPagination };
