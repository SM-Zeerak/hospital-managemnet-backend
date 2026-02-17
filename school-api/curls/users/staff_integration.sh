#!/bin/bash

# Configuration
API_BASE="http://localhost:4004/api/v1"
TOKEN="your_jwt_token_here"

# 1. Create User with Staff details and Image (Multipart)
echo "1. Creating User with Image (Inline Multipart)..."
curl -X POST "$API_BASE/school/users" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/image.jpg" \
  -F "data={
    \"email\": \"staff_multipart@example.com\",
    \"password\": \"Password123!\",
    \"firstName\": \"Multipart\",
    \"lastName\": \"User\",
    \"staff\": {
      \"salary\": 75000,
      \"personalInfo\": {
        \"phone\": \"1122334455\"
      }
    }
  }"

# 2. Update User with new Image (Multipart)
# Replace USER_ID with the ID from step 1
echo -e "\n\n2. Updating User with new Image (Inline Multipart)..."
USER_ID="replace_with_user_id"
curl -X PATCH "$API_BASE/school/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/new_image.jpg" \
  -F "data={
    \"firstName\": \"Updated Multipart\",
    \"staff\": {
      \"salary\": 80000
    }
  }"

# 3. Get User (to verify)
echo -e "\n\n3. Getting User details..."
curl -X GET "$API_BASE/school/users/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
