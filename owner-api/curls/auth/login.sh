#!/usr/bin/env bash
# Owner login (returns access/refresh tokens and user payload)
curl -X POST "{{base_url}}/owner/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@freightezcrm.com",
    "password": "ChangeMe123!"
  }'
