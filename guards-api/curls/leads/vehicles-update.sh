#!/bin/bash

# Update Lead Vehicle
# PATCH /api/v1/tenant/leads/:leadId/vehicles/:vehicleId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/leads/{{LEAD_ID}}/vehicles/{{VEHICLE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "carrierPay": 500,
    "brokerFee": 100,
    "color": "Red"
  }' \
  -w "\n"

