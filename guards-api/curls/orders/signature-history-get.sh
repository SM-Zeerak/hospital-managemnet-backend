#!/bin/bash

# Get Order Signature History by ID
# GET /api/v1/tenant/orders/:orderId/signature-history/:signatureId

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"
signature_id="{{SIGNATURE_ID}}"

curl -X GET "{{base_url}}/tenant/orders/{{ORDER_ID}}/signature-history/{{SIGNATURE_ID}}" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -w "\n"
