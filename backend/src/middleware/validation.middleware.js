// ─────────────────────────────────────────────────────────────────────────────
// Zod Validation Middleware — validates body, params, and query against schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a validation middleware for a Zod schema
 * @param {Object} schemas - Object with optional body, params, query Zod schemas
 * @param {import('zod').ZodSchema} [schemas.body] - Request body schema
 * @param {import('zod').ZodSchema} [schemas.params] - URL params schema
 * @param {import('zod').ZodSchema} [schemas.query] - Query string schema
 * @returns {Function} Express middleware
 */
function validate(schemas) {
  return (req, res, next) => {
    const errors = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `body.${issue.path.join('.')}`,
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        req.body = result.data; // Use transformed/validated data
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `params.${issue.path.join('.')}`,
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        req.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map((issue) => ({
            field: `query.${issue.path.join('.')}`,
            message: issue.message,
            code: issue.code,
          }))
        );
      } else {
        req.query = result.data;
      }
    }

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors,
      });
    }

    next();
  };
}

module.exports = { validate };
