#!/usr/bin/env bash
# Create template (super-admin token required)
curl -X POST "{{base_url}}/owner/templates" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "tenant.outage-notice",
    "name": "Outage Notice",
    "type": "email",
    "description": "Send when maintenance impacts tenants",
    "content": "Hi {{adminName}},\nWe are performing maintenance on {{window}}.",
    "metadata": {
      "subject": "Scheduled Maintenance"
    }
  }'
