#!/usr/bin/env bash

# Reset password using reset token

curl -X POST "${BASE_URL}/api/v1/hospital/staff-auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "${RESET_TOKEN}",
    "newPassword": "NewSecurePass123!"
  }'

