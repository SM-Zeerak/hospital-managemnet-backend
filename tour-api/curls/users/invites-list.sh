#!/bin/bash

# List User Invites
# GET /api/v1/tenant/users/invites

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - status: pending | accepted | cancelled (default: pending)
# - search: Search term for email/name
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)

curl -X GET "{{base_url}}/tenant/users/invites?status=pending&limit=20" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

