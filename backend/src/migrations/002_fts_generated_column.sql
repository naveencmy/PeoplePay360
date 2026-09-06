-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 002: High-Performance PostgreSQL Full-Text Search (FTS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add generated STORED tsvector column on employees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE employees ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '')), 'A') ||
      setweight(to_tsvector('english', coalesce(email, '')), 'B') ||
      setweight(to_tsvector('english', coalesce(department, '') || ' ' || coalesce(designation, '')), 'C')
    ) STORED;
  END IF;
END $$;

-- Deploy GIN index for high-speed sub-millisecond search
CREATE INDEX IF NOT EXISTS idx_employees_fts ON employees USING GIN(search_vector);
