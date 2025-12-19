#!/usr/bin/env bash

# List all super admins with pagination

curl -X GET "${BASE_URL}/api/v1/superadmin/super-admins?page=1&limit=20" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json"

