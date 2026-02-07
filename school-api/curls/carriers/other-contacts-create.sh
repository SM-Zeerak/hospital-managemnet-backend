#!/usr/bin/env bash
# Create a new other contact for a carrier (requires bearer token)
# Usage: CARRIER_ID=<uuid> ./other-contacts-create.sh
curl -X POST "{{base_url}}/carriers/{{CARRIER_ID}}/other-contacts" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "contactName": "Contact 1",
    "contactPhone": "555-123-4567",
    "contactEmail": "contact1@example.com",
    "contactType": "Emergency",
    "notes": "Available 24/7",
    "status": "active"
  }'

