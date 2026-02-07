#!/usr/bin/env bash
# Update driver (requires bearer token)
# Usage: CARRIER_ID=<uuid> DRIVER_ID=<uuid> ./drivers-update.sh
curl -X PATCH "{{base_url}}/carriers/{{CARRIER_ID}}/drivers/{{DRIVER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "driverPhone": "564-888-4063",
    "status": "active"
  }'

