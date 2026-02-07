#!/usr/bin/env bash
# List all drivers for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./drivers-list.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/drivers" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

