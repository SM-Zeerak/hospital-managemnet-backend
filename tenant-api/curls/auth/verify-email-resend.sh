#!/usr/bin/env bash
# Resend email verification OTP
# Usage: TENANT_EMAIL=user@example.com ./verify-email-resend.sh

curl -X POST "{{base_url}}/tenant/auth/verify-email/resend" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant.admin@freightezcrm.com"
  }'

