#!/usr/bin/env bash
# Obtain new access/refresh tokens using a refresh token
curl -X POST "{{base_url}}/owner/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"${OWNER_REFRESH_TOKEN}\"
  }"


