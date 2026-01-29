#!/bin/bash

# Convert Quote to Order
# POST /api/v1/tenant/orders (with quoteId in body)
# Note: Required fields: transportType, firstAvailablePickup, referralSource, carrierPayTerms, brokerFeeTerms
# Note: The quote must have amount, margin, and costAmount OR they must be provided in the request body

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/orders" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "{{QUOTE_ID}}",
    "transportType": "Enclosed",
    "firstAvailablePickup": "2025-12-15T00:00:00Z",
    "referralSource": "Website",
    "carrierPayTerms": "COD - Cash",
    "brokerFeeTerms": "Charge on Dispatch",
    "amount": 5000.00,
    "margin": 20.5,
    "costAmount": 4000.00,
    "pickupDate": "2025-12-15T00:00:00Z",
    "deliveryDate": "2025-12-20T00:00:00Z",
    "customerName": "John Doe",
    "assignedTo": "{{USER_ID}}"
  }' \
  -w "\n"

