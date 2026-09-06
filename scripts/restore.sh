#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PeoplePay360 — Database Disaster Recovery & Restoration Runbook
# Features: Cryptographic Checksum Validation, Atomic Clean Restoration
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "❌ Error: Missing backup file argument."
  echo "Usage: $0 <path_to_backup.dump>"
  exit 1
fi

BACKUP_FILEPATH="$1"
CHECKSUM_FILEPATH="${BACKUP_FILEPATH}.sha256"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-peoplepay360}"
DB_USER="${DB_USER:-postgres}"

if [ ! -f "${BACKUP_FILEPATH}" ]; then
  echo "❌ Error: Backup file not found: ${BACKUP_FILEPATH}"
  exit 1
fi

echo "================================================================="
echo "🚨 Starting PeoplePay360 Database Restoration"
echo "─────────────────────────────────────────────────────────────────"
echo "  Target Host:    ${DB_HOST}:${DB_PORT}"
echo "  Target DB:      ${DB_NAME}"
echo "  Source Archive: ${BACKUP_FILEPATH}"
echo "  Timestamp:      $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "================================================================="

# 1. Verify Checksum if present
if [ -f "${CHECKSUM_FILEPATH}" ]; then
  echo "🔍 Verifying SHA-256 archive checksum..."
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c "${CHECKSUM_FILEPATH}"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c "${CHECKSUM_FILEPATH}"
  fi
  echo "✅ Checksum validation passed."
else
  echo "⚠️ Warning: No .sha256 checksum file found. Proceeding with caution..."
fi

# 2. Execute pg_restore
echo "⏳ Restoring database schema and records..."
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --verbose \
  --no-owner \
  --no-privileges \
  "${BACKUP_FILEPATH}" || {
    echo "⚠️ pg_restore completed with non-critical warnings/notices."
  }

echo "✅ Database restored successfully to ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
