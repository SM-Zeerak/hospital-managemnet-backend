#!/bin/bash

# Suspend User
# POST /api/v1/tenant/users/:id/suspend

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
user_id="${1:-00000000-0000-0000-0000-000000000000}"

curl -X POST "{{base_url}}/tenant/users/{{USER_ID}}/suspend" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

