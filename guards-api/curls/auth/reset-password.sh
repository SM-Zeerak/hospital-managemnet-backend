#!/usr/bin/env bash
# Reset password with a valid reset token and OTP
# Usage: TENANT_RESET_TOKEN=<token> TENANT_OTP=<6-digit-otp> ./reset-password.sh

curl -X POST "{{base_url}}/tenant/auth/reset" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"${TENANT_RESET_TOKEN}\",
    \"password\": \"NewPassword123!\",
    \"otp\": \"${TENANT_OTP}\"
  }"

