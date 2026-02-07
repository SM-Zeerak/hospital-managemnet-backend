#!/bin/bash

# Create Order Signature History
# POST /api/v1/tenant/orders/:orderId/signature-history

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X POST "{{base_url}}/tenant/orders/{{ORDER_ID}}/signature-history" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "signedBy": "John Doe",
    "signatureType": "original",
    "signedDate": "2025-12-10T10:00:00Z"
  }' \
  -w "\n"

