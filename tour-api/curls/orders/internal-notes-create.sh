#!/bin/bash

# Create Order Internal Note
# POST /api/v1/tenant/orders/:orderId/internal-notes

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X POST "{{base_url}}/tenant/orders/{{ORDER_ID}}/internal-notes" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Internal note about this order"
  }' \
  -w "\n"

