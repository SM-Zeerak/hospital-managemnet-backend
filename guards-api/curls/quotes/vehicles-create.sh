#!/bin/bash

# Create Quote Vehicle
# POST /api/v1/tenant/quotes/:quoteId/vehicles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/quotes/{{QUOTE_ID}}/vehicles" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "modelYear": 2020,
    "make": "Audi",
    "model": "100",
    "type": "Car",
    "inop": false,
    "carrierPay": 0.00,
    "brokerFee": 0.00,
    "vin": "WAUZZZ4G0DN123456",
    "plateNumber": "ABC123",
    "color": "Black",
    "weight": 3500.00,
    "notes": "Vehicle notes"
  }' \
  -w "\n"

