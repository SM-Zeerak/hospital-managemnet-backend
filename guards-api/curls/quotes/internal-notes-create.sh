#!/bin/bash

# Create Quote Internal Note
# POST /api/v1/tenant/quotes/:quoteId/internal-notes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/internal-notes" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Customer requested expedited shipping. Follow up needed."
  }' \
  -w "\n"

