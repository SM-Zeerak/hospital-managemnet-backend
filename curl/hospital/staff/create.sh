#!/usr/bin/env bash

# Create a new staff member (requires authentication and staff:create permission or super-admin)

curl -X POST "${BASE_URL}/api/v1/hospital/staff" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newstaff@hospital.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "department": "Cardiology",
    "position": "Senior Doctor",
    "employeeId": "EMP001",
    "role": "doctor",
    "isActive": true,
    "permissions": [
      "patient:view",
      "patient:update",
      "appointment:create",
      "appointment:view",
      "medical_record:create",
      "medical_record:view"
    ]
  }'

