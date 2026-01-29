#!/usr/bin/env bash
# Delete carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./delete.sh
curl -X DELETE "{{base_url}}/carriers/{{CARRIER_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

