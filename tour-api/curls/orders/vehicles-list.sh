#!/bin/bash

# List Order Vehicles
# GET /api/v1/tenant/orders/:orderId/vehicles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X GET "{{base_url}}/tenant/orders/{{ORDER_ID}}/vehicles" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

