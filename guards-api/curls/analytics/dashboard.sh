#!/usr/bin/env bash
# Fetch dashboard analytics summary
curl -X GET "{{base_url}}/analytics/dashboard" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"
