#!/bin/bash

# Create Permission
# POST /api/v1/tenant/permissions

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/permissions" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "users.read",
    "name": "Read Users",
    "description": "Permission to read user information"
  }' \
  -w "\n"

