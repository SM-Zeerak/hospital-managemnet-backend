#!/bin/bash

# Update Department
# PATCH /api/v1/tenant/departments/:id

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -X PATCH "{{base_url}}/tenant/departments/{{DEPARTMENT_ID}}" \
  -H "Authorization: Bearer ${TENANT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sales Department",
    "description": "Updated description"
  }' \
  -w "\n"

