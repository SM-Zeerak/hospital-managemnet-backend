#!/bin/bash

# List Roles with Filters and Pagination
# GET /api/v1/tenant/roles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - search: Search term for name or description
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: name | createdAt | updatedAt
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/roles?search=admin&limit=20&offset=0&orderBy=createdAt&orderDir=DESC" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

