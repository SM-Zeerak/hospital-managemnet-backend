#!/usr/bin/env bash
SINCE=${1:-0}
curl -X GET "{{base_url}}/owner/export/templates?since=${SINCE}" \
  -H "Authorization: Bearer ${TENANT_SYNC_WEBHOOK_TOKEN}" \
  -H "Content-Type: application/json"
