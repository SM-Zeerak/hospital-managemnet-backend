#!/usr/bin/env bash

# Staff login to get access and refresh tokens

curl -X POST "${BASE_URL}/api/v1/hospital/staff-auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@hospital.com",
    "password": "SecurePass123!"
  }'

