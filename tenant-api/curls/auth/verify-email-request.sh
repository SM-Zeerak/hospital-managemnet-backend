#!/usr/bin/env bash
# Request email verification OTP
curl -X POST "{{base_url}}/tenant/auth/verify-email/request" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant.admin@freightezcrm.com"
  }'

