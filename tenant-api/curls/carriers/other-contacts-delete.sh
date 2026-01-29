#!/usr/bin/env bash
# Delete other contact (requires bearer token)
# Usage: CARRIER_ID=<uuid> CONTACT_ID=<uuid> ./other-contacts-delete.sh
curl -X DELETE "{{base_url}}/carriers/{{CARRIER_ID}}/other-contacts/{{CONTACT_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

