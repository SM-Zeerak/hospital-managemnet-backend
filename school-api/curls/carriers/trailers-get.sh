#!/usr/bin/env bash
# Get trailer details (requires bearer token)
# Usage: CARRIER_ID=<uuid> TRAILER_ID=<uuid> ./trailers-get.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/trailers/{{TRAILER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

