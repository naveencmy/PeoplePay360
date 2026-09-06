#!/bin/sh
set -eu

SSL_DIR="$(dirname "$0")/../nginx/ssl"
mkdir -p "$SSL_DIR"

if [ -f "$SSL_DIR/server.crt" ] && [ -f "$SSL_DIR/server.key" ]; then
    echo "🔒 SSL certificates already exist in $SSL_DIR"
    exit 0
fi

echo "🔐 Generating self-signed SSL certificates for local testing..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/server.key" \
    -out "$SSL_DIR/server.crt" \
    -subj "/C=US/ST=CA/L=SF/O=PeoplePay360/OU=Engineering/CN=localhost"

chmod 600 "$SSL_DIR/server.key"
chmod 644 "$SSL_DIR/server.crt"

echo "✅ SSL certificates generated successfully at $SSL_DIR"
