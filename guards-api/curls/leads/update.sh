#!/bin/bash

# Update Lead
# PATCH /api/v1/tenant/leads/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/leads/{{LEAD_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "transportType": "Enclosed",
    "totalTariff": 1200,
    "totalCarrierPay": 1000,
    "totalBrokerFee": 200,
    "shipperNote": "Handle with care"
  }' \
  -w "\n"

