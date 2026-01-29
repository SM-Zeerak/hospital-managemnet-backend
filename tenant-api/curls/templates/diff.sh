#!/usr/bin/env bash
SINCE=${1:-0}
curl -X GET "{{base_url}}/templates/diff?since={{SINCE}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json"
