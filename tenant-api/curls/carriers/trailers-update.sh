#!/usr/bin/env bash
# Update trailer (requires bearer token)
# Usage: CARRIER_ID=<uuid> TRAILER_ID=<uuid> ./trailers-update.sh
curl -X PATCH "{{base_url}}/carriers/{{CARRIER_ID}}/trailers/{{TRAILER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "48ft flatbed trailer with winch",
    "status": "active"
  }'

