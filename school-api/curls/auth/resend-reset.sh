#!/usr/bin/env bash
# Resend password reset OTP
# Usage: TENANT_EMAIL=user@example.com ./resend-reset.sh

curl -X POST "{{base_url}}/tenant/auth/request-reset/resend" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant.admin@freightezcrm.com"
  }'

