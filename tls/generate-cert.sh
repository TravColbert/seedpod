#!/usr/bin/env bash
set -euo pipefail

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout ./tls/server.key \
  -out ./tls/server.cert \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Created tls/server.key and tls/server.cert"
