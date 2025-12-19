#!/usr/bin/env bash

# Get all available permissions and modules

curl -X GET "${BASE_URL}/api/v1/hospital/permissions" \
  -H "Content-Type: application/json"

