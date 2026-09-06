-- Rollback Migration 002
DROP INDEX IF EXISTS idx_employees_fts;
ALTER TABLE employees DROP COLUMN IF EXISTS search_vector;
