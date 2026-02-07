#!/bin/bash

# Create Lead Vehicle
# POST /api/v1/tenant/leads/:leadId/vehicles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X POST "{{base_url}}/tenant/leads/{{LEAD_ID}}/vehicles" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "modelYear": 2021,
    "make": "BMW",
    "model": "Z4",
    "type": "Car",
    "inop": false,
    "carrierPay": 0,
    "brokerFee": 0,
    "vin": "n/a",
    "plateNumber": "N/A",
    "color": "n/a",
    "weight": null,
    "mods": "N/A",
    "notes": "N/A",
    "addOn": "N/A",
    "lotNumber": "n/a"
  }' \
  -w "\n"

