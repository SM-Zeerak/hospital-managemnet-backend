#!/bin/bash

# Who can access guards module (roles that have guards permissions)
# GET /api/v1/guards/guards/who-can-access

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -s -X GET "${base_url}/guards/guards/who-can-access" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -w "\n"
