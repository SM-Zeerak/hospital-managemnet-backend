#!/usr/bin/env bash

# Refresh access token using refresh token

curl -X POST "${BASE_URL}/api/v1/superadmin/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "${REFRESH_TOKEN}"
  }'

