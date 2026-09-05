// Test setup — set environment variables for test mode
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'peoplepay360_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-32-chars-long';
process.env.JWT_REFRESH_EXPIRY = '7d';
process.env.COMPANY_NAME = 'PeoplePay360 Test';
process.env.CURRENCY_CODE = 'INR';
process.env.CURRENCY_SYMBOL = '₹';
process.env.MIN_WAGE = '15000';
