#!/usr/bin/env bash
# Logout (send refresh token as bearer)
curl -X POST "{{base_url}}/owner/auth/logout" \
  -H "Authorization: Bearer ${OWNER_REFRESH_TOKEN}"
