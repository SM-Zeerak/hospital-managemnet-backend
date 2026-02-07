#!/bin/bash

# Convert Lead to Quote
# POST /api/v1/tenant/leads/:id/convert-to-quote

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/leads/{{LEAD_ID}}/convert-to-quote" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000.00,
    "costAmount": 4000.00,
    "quoteStatus": "New",
    "shippingDate": "2025-12-15T00:00:00Z",
    "shipperNote": "Additional notes for the quote",
    "requireCcOnEdocFrom": "customer@example.com",
    "originAddress": "123 Main St",
    "originAddress2": "Suite 100",
    "originContactName": "John Doe",
    "originContactPhone": "555-0100",
    "originContactEmail": "origin@example.com",
    "destinationAddress": "456 Oak Ave",
    "destinationAddress2": "Unit 200",
    "destinationContactName": "Jane Smith",
    "destinationContactPhone": "555-0200",
    "destinationContactEmail": "destination@example.com"
  }' \
  -w "\n"

