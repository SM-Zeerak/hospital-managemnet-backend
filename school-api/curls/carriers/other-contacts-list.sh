#!/usr/bin/env bash
# List all other contacts for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./other-contacts-list.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/other-contacts" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

