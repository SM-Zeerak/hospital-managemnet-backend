#!/usr/bin/env bash
# Verify email with OTP
# Usage: TENANT_EMAIL=user@example.com TENANT_OTP=<6-digit-otp> ./verify-email.sh

curl -X POST "{{base_url}}/tenant/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TENANT_EMAIL:-tenant.admin@freightezcrm.com}\",
    \"otp\": \"${TENANT_OTP}\"
  }"

