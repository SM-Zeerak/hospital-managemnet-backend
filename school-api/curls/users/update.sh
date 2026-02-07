#!/bin/bash

# Update User
# PATCH /api/v1/tenant/users/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
user_id="${1:-00000000-0000-0000-0000-000000000000}"

curl -X PATCH "{{base_url}}/tenant/users/{{USER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "departmentId": "00000000-0000-0000-0000-000000000000",
    "roleIds": ["00000000-0000-0000-0000-000000000000"],
    "status": "active"
  }'

