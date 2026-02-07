#!/bin/bash

# Update Quote
# PATCH /api/v1/tenant/quotes/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/quotes/{{QUOTE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Hot",
    "quoteStatus": "Hot",
    "amount": 1600.00,
    "costAmount": 1250.00,
    "shipperNote": "Updated shipper note",
    "notes": "Updated notes"
  }' \
  -w "\n"

