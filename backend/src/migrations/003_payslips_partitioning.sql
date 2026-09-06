-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 003: Data Retention & Range Partitioning for Payslips
-- ═══════════════════════════════════════════════════════════════════════════════

-- Partition table payslips by RANGE (period_start)
CREATE TABLE IF NOT EXISTS payslips (
  id UUID DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payrun_id UUID NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  worked_days NUMERIC(5, 2) NOT NULL,
  total_days NUMERIC(5, 2) NOT NULL,
  lines JSONB NOT NULL DEFAULT '[]',
  gross NUMERIC(15, 2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
  net NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'COMPUTED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id, period_start)
) PARTITION BY RANGE (period_start);

-- Default Catch-All Partition
CREATE TABLE IF NOT EXISTS payslips_default PARTITION OF payslips DEFAULT;

-- 2024 Quarterly Partitions
CREATE TABLE IF NOT EXISTS payslips_2024_q1 PARTITION OF payslips FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
CREATE TABLE IF NOT EXISTS payslips_2024_q2 PARTITION OF payslips FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');
CREATE TABLE IF NOT EXISTS payslips_2024_q3 PARTITION OF payslips FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');
CREATE TABLE IF NOT EXISTS payslips_2024_q4 PARTITION OF payslips FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');

-- 2025 Quarterly Partitions
CREATE TABLE IF NOT EXISTS payslips_2025_q1 PARTITION OF payslips FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS payslips_2025_q2 PARTITION OF payslips FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS payslips_2025_q3 PARTITION OF payslips FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS payslips_2025_q4 PARTITION OF payslips FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

-- 2026 Quarterly Partitions
CREATE TABLE IF NOT EXISTS payslips_2026_q1 PARTITION OF payslips FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS payslips_2026_q2 PARTITION OF payslips FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS payslips_2026_q3 PARTITION OF payslips FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS payslips_2026_q4 PARTITION OF payslips FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

-- 2027 Quarterly Partitions
CREATE TABLE IF NOT EXISTS payslips_2027_q1 PARTITION OF payslips FOR VALUES FROM ('2027-01-01') TO ('2027-04-01');
CREATE TABLE IF NOT EXISTS payslips_2027_q2 PARTITION OF payslips FOR VALUES FROM ('2027-04-01') TO ('2027-07-01');
CREATE TABLE IF NOT EXISTS payslips_2027_q3 PARTITION OF payslips FOR VALUES FROM ('2027-07-01') TO ('2027-10-01');
CREATE TABLE IF NOT EXISTS payslips_2027_q4 PARTITION OF payslips FOR VALUES FROM ('2027-10-01') TO ('2028-01-01');

-- High Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payslips_payrun ON payslips(payrun_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_period ON payslips(period_start, period_end);
