#!/bin/bash

# Delete Quote
# DELETE /api/v1/tenant/quotes/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X DELETE "{{base_url}}/tenant/quotes/{{QUOTE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -w "\n"

