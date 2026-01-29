#!/usr/bin/env bash
# List cached templates for tenant UI
curl -X GET "{{base_url}}/templates" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"
