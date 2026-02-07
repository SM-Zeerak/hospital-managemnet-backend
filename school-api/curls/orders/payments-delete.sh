#!/bin/bash

# Delete Order Payment
# DELETE /api/v1/tenant/orders/:orderId/payments/:paymentId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"
payment_id="{{PAYMENT_ID}}"

curl -X DELETE "{{base_url}}/tenant/orders/{{ORDER_ID}}/payments/{{PAYMENT_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"

