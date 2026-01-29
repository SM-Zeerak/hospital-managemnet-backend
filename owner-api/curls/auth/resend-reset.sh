#!/usr/bin/env bash
# Resend password reset OTP (owner)
# Usage: OWNER_EMAIL=user@example.com ./resend-reset.sh

curl -X POST "{{base_url}}/owner/auth/request-reset/resend" \
  -H "Content-Type: application/json" \
  -d @- <<JSON
{
  "email": "${OWNER_EMAIL:-owner@example.com}"
}
JSON

