#!/bin/bash

# List Order Signature History
# GET /api/v1/tenant/orders/:orderId/signature-history

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X GET "{{base_url}}/tenant/orders/{{ORDER_ID}}/signature-history" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

