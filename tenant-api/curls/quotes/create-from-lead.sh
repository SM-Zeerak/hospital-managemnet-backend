#!/bin/bash

# Create Quote (from Lead - with leadId)
# POST /api/v1/tenant/quotes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/quotes" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "{{LEAD_ID}}",
    "quoteStatus": "New",
    "transportType": "Open",
    "shippingDate": "2025-12-11T00:00:00Z",
    "assignedUser": "{{USER_ID}}",
    "assignedTeam": "Sales",
    "amount": 1500.00,
    "costAmount": 1200.00,
    "notes": "Quote notes here"
  }' \
  -w "\n"

