const { Router } = require('express');

const router = Router();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PeoplePay360 API',
    version: '1.0.0',
    description: 'Production-grade Payroll Management & Salary Computation API with N-layer architecture, pg-boss background queue, and safe mathematical AST evaluation.',
  },
  servers: [
    { url: '/api', description: 'Current Environment' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'API Health Check',
        responses: {
          200: { description: 'API is healthy and operational' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'first_name', 'last_name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  first_name: { type: 'string' },
                  last_name: { type: 'string' },
                  role: { type: 'string', enum: ['SUPER_ADMIN', 'HR_ADMIN', 'PAYROLL_OFFICER', 'EMPLOYEE'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate and receive JWT token pair',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully with accessToken and refreshToken' },
        },
      },
    },
    '/employees': {
      get: {
        summary: 'List employees with pagination and full-text search',
        tags: ['Employees'],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'PostgreSQL tsvector search' },
          { name: 'department', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'List of employees with pagination metadata' } },
      },
      post: {
        summary: 'Create employee record',
        tags: ['Employees'],
        responses: { 201: { description: 'Employee created' } },
      },
    },
    '/contracts': {
      get: { summary: 'List employee contracts', tags: ['Contracts'], responses: { 200: { description: 'Contract list' } } },
      post: { summary: 'Create salary contract', tags: ['Contracts'], responses: { 201: { description: 'Contract created' } } },
    },
    '/salary/structures': {
      get: { summary: 'List salary structures with active rules', tags: ['Salary Engine'], responses: { 200: { description: 'Structures' } } },
      post: { summary: 'Create salary structure', tags: ['Salary Engine'], responses: { 201: { description: 'Structure created' } } },
    },
    '/payruns': {
      get: { summary: 'List payroll runs with state filters', tags: ['Payruns'], responses: { 200: { description: 'Payruns' } } },
      post: { summary: 'Initialize a payrun in DRAFT state', tags: ['Payruns'], responses: { 201: { description: 'Payrun created in DRAFT' } } },
    },
    '/payruns/{id}/compute': {
      post: {
        summary: 'Compute all payslips via DAG topological sort (triggers pg-boss singleton job)',
        tags: ['Payruns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Payrun computed or enqueued' } },
      },
    },
    '/payruns/{id}/validate': {
      put: {
        summary: 'Validate payrun and transition COMPUTED -> VALIDATED',
        tags: ['Payruns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Payrun validated' } },
      },
    },
    '/payruns/{id}/mark-paid': {
      put: {
        summary: 'Mark payrun as PAID and generate payment records',
        tags: ['Payruns'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Payrun marked PAID' } },
      },
    },
    '/payslips/{id}/pdf': {
      get: {
        summary: 'Download payslip PDF generated via PDFKit',
        tags: ['Payslips'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Binary PDF file' } },
      },
    },
    '/dashboard/kpis': {
      get: {
        summary: 'Retrieve Redis-cached executive dashboard KPIs',
        tags: ['Dashboard'],
        responses: { 200: { description: 'Executive KPIs, salary distribution, trends' } },
      },
    },
  },
};

router.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});

router.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>PeoplePay360 API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/api/docs/openapi.json',
          dom_id: '#swagger-ui',
        });
      };
    </script>
  </body>
</html>`);
});

module.exports = router;
