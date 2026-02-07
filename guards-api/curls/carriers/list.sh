#!/usr/bin/env bash
# List all carriers (requires bearer token)
curl -X GET "{{base_url}}/carriers" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"

