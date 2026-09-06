-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 001: Initial Core Relational Schema
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

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
  category VARCHAR(50) NOT NULL,
  sequence INTEGER NOT NULL DEFAULT 10,
  computation_type VARCHAR(50) NOT NULL,
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

-- Working Schedules Table
CREATE TABLE IF NOT EXISTS working_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  days_per_week INTEGER NOT NULL DEFAULT 5,
  hours_per_week NUMERIC(5, 2) NOT NULL DEFAULT 40,
  grid JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  company VARCHAR(100) DEFAULT 'PeoplePay360 Global',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employee_id, state);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_timeoff_employee_period ON timeoff_requests(employee_id, date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
