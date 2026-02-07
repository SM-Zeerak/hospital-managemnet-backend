#!/usr/bin/env bash
# Create a new trailer for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./trailers-create.sh
curl -X POST "{{base_url}}/carriers/{{CARRIER_ID}}/trailers" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "trailerType": "Flatbed",
    "description": "48ft flatbed trailer",
    "status": "active"
  }'

