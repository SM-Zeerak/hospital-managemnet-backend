#!/usr/bin/env bash
# Update insurance policy (requires bearer token)
# Usage: CARRIER_ID=<uuid> INSURANCE_ID=<uuid> ./insurance-update.sh
curl -X PATCH "{{base_url}}/carriers/{{CARRIER_ID}}/insurance/{{INSURANCE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "liabilityAmount": 1500000.00,
    "status": "active"
  }'

