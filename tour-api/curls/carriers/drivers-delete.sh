#!/usr/bin/env bash
# Delete driver (requires bearer token)
# Usage: CARRIER_ID=<uuid> DRIVER_ID=<uuid> ./drivers-delete.sh
curl -X DELETE "{{base_url}}/carriers/{{CARRIER_ID}}/drivers/{{DRIVER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

