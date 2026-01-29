#!/usr/bin/env bash
# List templates (requires bearer token)
curl -X GET "{{base_url}}/owner/templates" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json"
