#!/usr/bin/env bash
# Request a password reset OTP
curl -X POST "{{base_url}}/tenant/auth/request-reset" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant.admin@freightezcrm.com"
  }'

