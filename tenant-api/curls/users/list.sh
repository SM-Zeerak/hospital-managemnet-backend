#!/bin/bash

# List Users with Filters
# GET /api/v1/tenant/users

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - search: Search term for name/email
# - status: active | suspended
# - departmentId: Filter by department
# - roleId: Filter by role
# - dateFrom: Filter by creation date (ISO 8601)
# - dateTo: Filter by creation date (ISO 8601)
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt | lastLoginAt | firstName | lastName | email
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/users?search=john&status=active&limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

