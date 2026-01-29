#!/usr/bin/env bash
# Get carrier details by ID (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./get.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

