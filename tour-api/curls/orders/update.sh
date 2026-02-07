#!/bin/bash

# Update Order
# PATCH /api/v1/tenant/orders/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X PATCH "{{base_url}}/tenant/orders/{{ORDER_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "orderStatus": "awaiting_dispatch",
    "secondaryStatus": "Awaiting Customer Signature",
    "totalTariff": 1600.00,
    "carrierPay": 1300.00,
    "brokerFee": 300.00,
    "statusNotes": "Updated order details"
  }' \
  -w "\n"

