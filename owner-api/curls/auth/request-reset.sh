#!/usr/bin/env bash
# Request a password reset token
curl -X POST "{{base_url}}/owner/auth/request-reset" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@freightezcrm.com"
  }'


