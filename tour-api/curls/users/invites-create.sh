#!/bin/bash

# Create User Invite
# POST /api/v1/tenant/users/invites

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/users/invites" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invited@example.com",
    "firstName": "Invited",
    "lastName": "User",
    "departmentId": "00000000-0000-0000-0000-000000000000",
    "roleIds": ["00000000-0000-0000-0000-000000000000"]
  }'

