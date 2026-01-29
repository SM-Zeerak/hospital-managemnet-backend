#!/usr/bin/env bash
# Update carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./update.sh
curl -X PATCH "{{base_url}}/carriers/{{CARRIER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "hasWinch": true,
    "canDispatchFromForsee": true
  }'

