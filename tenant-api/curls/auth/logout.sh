#!/usr/bin/env bash
# Logout (send refresh token via x-refresh-token header or Authorization Bearer)
curl -X POST "{{base_url}}/tenant/auth/logout" \
  -H "x-refresh-token: ${TENANT_REFRESH_TOKEN}" \
  -H "Content-Type: application/json"

