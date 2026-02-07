#!/bin/bash

# Create Order Payment
# POST /api/v1/tenant/orders/:orderId/payments

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X POST "{{base_url}}/tenant/orders/{{ORDER_ID}}/payments" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentType": "Customer Owes Broker",
    "amount": 300.00,
    "paymentDate": "2025-12-10T10:00:00Z",
    "description": "Broker fee payment"
  }' \
  -w "\n"

