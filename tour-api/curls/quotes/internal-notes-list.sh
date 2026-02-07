#!/bin/bash

# List Quote Internal Notes
# GET /api/v1/tenant/quotes/:quoteId/internal-notes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: createdAt | updatedAt
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/internal-notes?limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

