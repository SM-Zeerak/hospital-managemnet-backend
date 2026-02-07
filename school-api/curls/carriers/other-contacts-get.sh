#!/usr/bin/env bash
# Get other contact details (requires bearer token)
# Usage: CARRIER_ID=<uuid> CONTACT_ID=<uuid> ./other-contacts-get.sh
curl -X GET "{{base_url}}/carriers/{{CARRIER_ID}}/other-contacts/{{CONTACT_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

