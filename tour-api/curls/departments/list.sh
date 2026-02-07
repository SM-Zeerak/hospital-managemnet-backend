#!/bin/bash

# List Departments with Filters and Pagination
# GET /api/v1/tenant/departments

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - search: Search term for name or description
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: name | createdAt | updatedAt
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/departments?search=sales&limit=20&offset=0&orderBy=name&orderDir=ASC" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

