#!/usr/bin/env bash

# Refresh staff access token using refresh token

curl -X POST "${BASE_URL}/api/v1/hospital/staff-auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "${REFRESH_TOKEN}"
  }'

