#!/usr/bin/env bash
# List all trailers for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./trailers-list.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/trailers" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

