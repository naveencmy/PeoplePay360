#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# PeoplePay360 — Production Database Backup & Retention Runbook
# Features: Atomic pg_dump -Fc, SHA-256 Checksum, Integrity Check, 7-Day Pruning
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Configuration with environment defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-peoplepay360}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
RETENTION_DAYS=7

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILENAME="peoplepay360_backup_${TIMESTAMP}.dump"
BACKUP_FILEPATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
CHECKSUM_FILEPATH="${BACKUP_FILEPATH}.sha256"

# Create backup directory if it does not exist
mkdir -p "${BACKUP_DIR}"

echo "================================================================="
echo "📦 Starting PeoplePay360 Database Backup"
echo "─────────────────────────────────────────────────────────────────"
echo "  Target Host:    ${DB_HOST}:${DB_PORT}"
echo "  Target DB:      ${DB_NAME}"
echo "  Destination:    ${BACKUP_FILEPATH}"
echo "  Timestamp:      $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "================================================================="

START_TIME=$(date +%s)

# Execute atomic compressed backup
echo "⏳ Executing pg_dump (-Fc format)..."
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -Fc \
  --verbose \
  --file="${BACKUP_FILEPATH}"

# Generate SHA-256 checksum for cryptographic verification
echo "🔒 Generating SHA-256 checksum..."
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${BACKUP_FILEPATH}" > "${CHECKSUM_FILEPATH}"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${BACKUP_FILEPATH}" > "${CHECKSUM_FILEPATH}"
else
  openssl dgst -sha256 "${BACKUP_FILEPATH}" > "${CHECKSUM_FILEPATH}"
fi

# Verify archive integrity with pg_restore list
echo "🔍 Verifying backup archive integrity..."
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_restore --list "${BACKUP_FILEPATH}" > /dev/null

BACKUP_SIZE=$(ls -lh "${BACKUP_FILEPATH}" | awk '{print $5}')
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "✅ Backup completed successfully!"
echo "   Archive File:   ${BACKUP_FILENAME} (${BACKUP_SIZE})"
echo "   Checksum File:  ${CHECKSUM_FILEPATH}"
echo "   Duration:       ${DURATION}s"

# Prune backups older than retention window (7 days)
echo "🧹 Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "peoplepay360_backup_*.dump*" -type f -mtime +${RETENTION_DAYS} -exec rm -f {} +

echo "🎉 Backup lifecycle execution complete."
