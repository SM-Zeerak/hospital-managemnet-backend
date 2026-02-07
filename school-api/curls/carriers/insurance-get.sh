#!/usr/bin/env bash
# Get insurance policy details (requires bearer token)
# Usage: CARRIER_ID=<uuid> INSURANCE_ID=<uuid> ./insurance-get.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/insurance/{{INSURANCE_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

