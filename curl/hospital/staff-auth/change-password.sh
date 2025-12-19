#!/usr/bin/env bash

# Change password (requires authentication)

curl -X POST "${BASE_URL}/api/v1/hospital/staff-auth/change-password" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePass123!"
  }'

