#!/bin/bash

# Get User Statistics
# GET /api/v1/tenant/users/stats

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X GET "{{base_url}}/tenant/users/stats" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

