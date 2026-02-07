#!/usr/bin/env bash
# Get driver details (requires bearer token)
# Usage: CARRIER_ID=<uuid> DRIVER_ID=<uuid> ./drivers-get.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/drivers/{{DRIVER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

