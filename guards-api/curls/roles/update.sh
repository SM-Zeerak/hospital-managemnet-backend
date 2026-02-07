#!/bin/bash

# Update Role
# PATCH /api/v1/tenant/roles/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/roles/{{ROLE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sales-manager",
    "description": "Updated Sales Manager Role",
    "permissionIds": ["permission-uuid-1", "permission-uuid-2", "permission-uuid-3"]
  }' \
  -w "\n"

