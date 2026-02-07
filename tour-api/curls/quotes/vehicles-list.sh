#!/bin/bash

# List Quote Vehicles
# GET /api/v1/tenant/quotes/:quoteId/vehicles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/vehicles?limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

