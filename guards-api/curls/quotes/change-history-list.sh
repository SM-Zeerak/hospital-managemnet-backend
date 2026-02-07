#!/bin/bash

# List Quote Change History
# GET /api/v1/tenant/quotes/:quoteId/change-history

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional query parameters:
# - limit: Number of results (default: 50)
# - offset: Pagination offset (default: 0)
# - orderBy: timeStamp | createdAt
# - orderDir: ASC | DESC

curl -X GET "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/change-history?limit=20&offset=0" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

