#!/usr/bin/env bash

# Login to get access and refresh tokens

curl -X POST "${BASE_URL}/api/v1/superadmin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "support@dynamixzone.com",
    "password": "Syed1234@"
  }'

