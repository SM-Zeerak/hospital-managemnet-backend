#!/usr/bin/env bash

# Update super admin details (requires super-admin role)

curl -X PUT "${BASE_URL}/api/v1/superadmin/super-admins/${SUPER_ADMIN_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Admin Name",
    "email": "updated@example.com",
    "role": "super-admin",
    "isActive": true
  }'

