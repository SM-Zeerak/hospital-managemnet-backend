#!/usr/bin/env bash
# Delete insurance policy (requires bearer token)
# Usage: CARRIER_ID=<uuid> INSURANCE_ID=<uuid> ./insurance-delete.sh
curl -X DELETE "{{base_url}}/carriers/{{CARRIER_ID}}/insurance/{{INSURANCE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

