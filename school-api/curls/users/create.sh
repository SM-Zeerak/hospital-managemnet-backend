#!/bin/bash

# Create User
# POST /api/v1/tenant/users

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/users" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "departmentId": "00000000-0000-0000-0000-000000000000",
    "roleIds": ["00000000-0000-0000-0000-000000000000"]
  }'

