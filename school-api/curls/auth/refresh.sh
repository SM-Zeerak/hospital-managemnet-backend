#!/usr/bin/env bash
# Obtain new access/refresh tokens using a refresh token
curl -X POST "{{base_url}}/tenant/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${TENANT_REFRESH_TOKEN}\"
  }"

