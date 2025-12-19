#!/usr/bin/env bash

# Get super admin by ID

curl -X GET "${BASE_URL}/api/v1/superadmin/super-admins/${SUPER_ADMIN_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

