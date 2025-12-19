#!/usr/bin/env bash

# Request password reset token

curl -X POST "${BASE_URL}/api/v1/hospital/staff-auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@hospital.com"
  }'

