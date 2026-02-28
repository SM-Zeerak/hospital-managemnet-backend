#!/bin/bash

# Create Guard (JSON body)
# POST /api/v1/guards/guards
# Required: guardId, name, cnic. For image/documents use create-multipart.sh

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

curl -s -X POST "${base_url}/guards/guards" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d '{
    "guardId": "G001",
    "dateOfRegistration": "2025-01-28",
    "name": "Ali Khan",
    "fatherName": "Rashid Khan",
    "dateOfBirth": "1990-05-15",
    "education": "Intermediate",
    "cnic": "35201-1234567-1",
    "currentAddress": "House 123, Block A, Lahore",
    "permanentAddress": "Village XYZ, District ABC",
    "contactNo1": "+92 300 1234567",
    "contactNo2": "+92 321 7654321",
    "salary": 35000,
    "policeDistrictCurrent": "Lahore Cantt",
    "policeDistrictPermanent": "District ABC",
    "sameAddress": false,
    "language": "Urdu",
    "married": true,
    "emergencyContact": {
      "name": "Sara Khan",
      "contactNo": "+92 321 0000000",
      "address": "Lahore",
      "cnic": "35201-9876543-2"
    },
    "services": {
      "type": "civilian",
      "unitNo": "U1",
      "experienceYears": "2"
    },
    "questions": {
      "workedAsGuard": true,
      "companyName": "SecureCo",
      "reasonOfLeaving": "Better opportunity",
      "apssaTrained": true,
      "workAnywhere": true,
      "armyCourtCase": false
    },
    "references": [
      {
        "name": "Referee One",
        "address": "Address 1",
        "cnic": "35201-1111111-1",
        "contact": "0300-1111111",
        "relation": "Former employer"
      },
      {
        "name": "Referee Two",
        "address": "Address 2",
        "cnic": "35201-2222222-2",
        "contact": "0300-2222222",
        "relation": "Relative"
      }
    ]
  }' \
  -w "\n"
