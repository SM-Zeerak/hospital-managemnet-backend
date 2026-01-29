#!/bin/bash

# List Dispatch Vehicles
# GET /api/v1/tenant/dispatch/:dispatchId/vehicles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
dispatch_id="{{DISPATCH_ID}}"

curl -X GET "{{base_url}}/tenant/dispatch/{{DISPATCH_ID}}/vehicles" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

