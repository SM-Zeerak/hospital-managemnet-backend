#!/usr/bin/env bash
# Fetch global template version (admin token required)
curl -X GET "{{base_url}}/owner/templates/version" \
  -H "Authorization: Bearer ${OWNER_API_TOKEN}" \
  -H "Content-Type: application/json"
