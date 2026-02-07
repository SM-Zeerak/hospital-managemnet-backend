#!/bin/bash

# Delete Order Vehicle
# DELETE /api/v1/tenant/orders/:orderId/vehicles/:vehicleId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"
vehicle_id="{{VEHICLE_ID}}"

curl -X DELETE "{{base_url}}/tenant/orders/{{ORDER_ID}}/vehicles/{{VEHICLE_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

