#!/bin/bash

# Create Role
# POST /api/v1/tenant/roles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/roles" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "sales-manager",
    "description": "Sales Manager Role",
    "permissionIds": ["permission-uuid-1", "permission-uuid-2"]
  }' \
  -w "\n"

