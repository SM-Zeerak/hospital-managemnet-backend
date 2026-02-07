#!/bin/bash

# Get Order by ID
# GET /api/v1/tenant/orders/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X GET "{{base_url}}/tenant/orders/{{ORDER_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

