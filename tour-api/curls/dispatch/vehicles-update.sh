#!/bin/bash

# Update Dispatch Vehicle
# PATCH /api/v1/tenant/dispatch/:dispatchId/vehicles/:vehicleId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"
vehicle_id="{{VEHICLE_ID}}"

curl -X PATCH "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}/vehicles/{{VEHICLE_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "carrierPay": 1300.00,
    "brokerFee": 350.00,
    "notes": "Updated vehicle notes"
  }' \
  -w "\n"

