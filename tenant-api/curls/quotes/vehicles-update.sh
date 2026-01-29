#!/bin/bash

# Update Quote Vehicle
# PATCH /api/v1/tenant/quotes/:quoteId/vehicles/:vehicleId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/vehicles/{{VEHICLE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "carrierPay": 1200.00,
    "brokerFee": 300.00,
    "notes": "Updated vehicle notes"
  }' \
  -w "\n"

