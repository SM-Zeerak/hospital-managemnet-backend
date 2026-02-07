#!/usr/bin/env bash
# Tenant login (returns access/refresh tokens)
curl -X POST "{{base_url}}/tenant/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant.admin@freightezcrm.com",
    "password": "ChangeMe123!"
  }'
