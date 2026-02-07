#!/bin/bash

# Update Order Signature History
# PATCH /api/v1/tenant/orders/:orderId/signature-history/:signatureId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"
signature_id="{{SIGNATURE_ID}}"

curl -X PATCH "{{base_url}}/tenant/orders/{{ORDER_ID}}/signature-history/{{SIGNATURE_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "signedBy": "Jane Doe",
    "signatureType": "change_order"
  }' \
  -w "\n"

