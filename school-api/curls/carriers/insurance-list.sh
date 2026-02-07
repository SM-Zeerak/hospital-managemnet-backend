#!/usr/bin/env bash
# List all insurance policies for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./insurance-list.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/insurance" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

