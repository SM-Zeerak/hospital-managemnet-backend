#!/bin/bash

# Create Order Vehicle
# POST /api/v1/tenant/orders/:orderId/vehicles

base_url="${base_url:-http://localhost:4002/api/v1}"
token="{{TENANT_API_TOKEN}}"
order_id="{{ORDER_ID}}"

curl -X POST "{{base_url}}/tenant/orders/{{ORDER_ID}}/vehicles" \
  -H "Authorization: Bearer {{TENANT_API_TOKEN}}" \
  -H "Content-Type: application/json" \
  -d '{
    "modelYear": 2020,
    "make": "Toyota",
    "model": "Camry",
    "type": "Sedan",
    "inop": false,
    "carrierPay": 1200.00,
    "brokerFee": 300.00,
    "vin": "1HGBH41JXMN109186",
    "plateNumber": "ABC123",
    "color": "Blue",
    "weight": 3500.00,
    "notes": "Vehicle notes"
  }' \
  -w "\n"

