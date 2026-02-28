#!/bin/bash

# List Guards with optional filters (guardId, name, cnic)
# GET /api/v1/guards/guards

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - guardId: Filter by guard ID (partial match)
# - name: Filter by name (partial match)
# - cnic: Filter by CNIC (partial match)
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt | name (default: createdAt)
# - orderDir: ASC | DESC (default: DESC)

curl -s -X GET "${base_url}/guards/guards?limit=20&offset=0&orderBy=createdAt&orderDir=DESC" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -w "\n"

# With filters (uncomment and set as needed):
# curl -s -X GET "${base_url}/guards/guards?guardId=G001&name=Ali&cnic=35201&limit=20&offset=0" \
#   -H "Authorization: Bearer ${token}" \
#   -H "Content-Type: application/json" \
#   -w "\n"
