-- ═══════════════════════════════════════════════════════════════════════════════
-- PeoplePay360 — Production Database Schema (PostgreSQL)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  employee_id UUID,
  is_active BOOLEAN DEFAULT true,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_location VARCHAR(100) DEFAULT 'Headquarters',
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  pan_number VARCHAR(20),
  uan_number VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Full-text search index on employees
CREATE INDEX IF NOT EXISTS idx_employees_search ON employees USING GIN(search_vector);

-- Trigger to maintain search_vector on employees
CREATE OR REPLACE FUNCTION employees_search_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.first_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.last_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.employee_code, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.email, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.department, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.designation, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employees_search ON employees;
CREATE TRIGGER trg_employees_search BEFORE INSERT OR UPDATE
ON employees FOR EACH ROW EXECUTE FUNCTION employees_search_trigger();

-- Salary Structures Table
CREATE TABLE IF NOT EXISTS salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Salary Rules Table
CREATE TABLE IF NOT EXISTS salary_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL, -- BASIC, ALLOWANCE, GROSS, DEDUCTION, NET
  sequence INTEGER NOT NULL DEFAULT 10,
  computation_type VARCHAR(50) NOT NULL, -- FIXED, PERCENTAGE, FORMULA
  computation_basis VARCHAR(50),
  amount NUMERIC(15, 2) DEFAULT 0,
  formula TEXT,
  condition TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  wage NUMERIC(15, 2) NOT NULL,
  wage_type VARCHAR(50) DEFAULT 'MONTHLY',
  structure_id UUID NOT NULL REFERENCES salary_structures(id),
  date_start DATE NOT NULL,
  date_end DATE,
  state VARCHAR(50) DEFAULT 'ACTIVE',
  department VARCHAR(100),
  job_title VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  worked_hours NUMERIC(6, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'PRESENT',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Time Off Requests Table
CREATE TABLE IF NOT EXISTS timeoff_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  duration NUMERIC(5, 2) NOT NULL DEFAULT 1,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  half_day BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payruns Table
CREATE TABLE IF NOT EXISTS payruns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  structure_id UUID REFERENCES salary_structures(id),
  state VARCHAR(50) DEFAULT 'DRAFT',
  department VARCHAR(100),
  notes TEXT,
  computed_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payslips Table
CREATE TABLE IF NOT EXISTS payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  performed_by UUID,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_state VARCHAR(50),
  new_state VARCHAR(50),
  metadata JSONB DEFAULT '{}'
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employee_id, state);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_timeoff_employee_period ON timeoff_requests(employee_id, date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_payslips_payrun ON payslips(payrun_id);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
