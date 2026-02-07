#!/usr/bin/env bash
# Update other contact (requires bearer token)
# Usage: CARRIER_ID=<uuid> CONTACT_ID=<uuid> ./other-contacts-update.sh
curl -X PATCH "{{base_url}}/carriers/{{CARRIER_ID}}/other-contacts/{{CONTACT_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "contactPhone": "555-123-4568",
    "notes": "Updated contact information"
  }'

