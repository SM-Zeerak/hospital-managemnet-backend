#!/bin/bash

# Update Permission
# PATCH /api/v1/tenant/permissions/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/permissions/{{PERMISSION_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Read Users",
    "description": "Updated permission to read user information"
  }' \
  -w "\n"

