#!/usr/bin/env bash

# Create a new super admin (requires super-admin role)

curl -X POST "${BASE_URL}/api/v1/superadmin/super-admins" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "SecurePass123!",
    "name": "New Admin",
    "role": "super-admin",
    "isActive": true
  }'

