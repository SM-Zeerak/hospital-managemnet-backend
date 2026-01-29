#!/usr/bin/env bash
# Delete trailer (requires bearer token)
# Usage: CARRIER_ID=<uuid> TRAILER_ID=<uuid> ./trailers-delete.sh
curl -X DELETE "{{base_url}}/carriers/{{CARRIER_ID}}/trailers/{{TRAILER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

