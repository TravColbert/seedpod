#!/usr/bin/env bash
set -euo pipefail

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout ./server.key \
  -out ./server.cert \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Created server.key and server.cert"
