#!/bin/bash

# Bulk User Operations
# POST /api/v1/tenant/users/bulk

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Actions: activate | suspend | delete

curl -X POST "{{base_url}}/tenant/users/bulk" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      "00000000-0000-0000-0000-000000000000",
      "11111111-1111-1111-1111-111111111111"
    ],
    "action": "suspend"
  }'

