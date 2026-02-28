#!/bin/bash

# Create Guard with multipart (image + document, documentDate/expireDate)
# POST /api/v1/guards/guards
# Required in data: guardId, name, cnic

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"

# Optional: set paths to files (leave empty to skip)
image_file="${IMAGE_FILE:-}"
document_file="${DOCUMENT_FILE:-}"
document_date="${DOCUMENT_DATE:-2025-01-01}"
expire_date="${EXPIRE_DATE:-2026-01-01}"

# Minimum required: guardId, name, cnic as JSON in "data" field (single line for -F)
data_json='{"guardId":"G002","name":"Ahmed Hassan","cnic":"35201-9876543-2","fatherName":"Hassan Ali","contactNo1":"+92 300 1111111","currentAddress":"Lahore"}'

if [ -n "$image_file" ] && [ -n "$document_file" ]; then
  curl -s -X POST "${base_url}/guards/guards" \
    -H "Authorization: Bearer ${token}" \
    -F "data=${data_json}" \
    -F "documentDate=${document_date}" \
    -F "expireDate=${expire_date}" \
    -F "image=@${image_file}" \
    -F "document=@${document_file}" \
    -w "\n"
elif [ -n "$image_file" ]; then
  curl -s -X POST "${base_url}/guards/guards" \
    -H "Authorization: Bearer ${token}" \
    -F "data=${data_json}" \
    -F "image=@${image_file}" \
    -w "\n"
elif [ -n "$document_file" ]; then
  curl -s -X POST "${base_url}/guards/guards" \
    -H "Authorization: Bearer ${token}" \
    -F "data=${data_json}" \
    -F "documentDate=${document_date}" \
    -F "expireDate=${expire_date}" \
    -F "document=@${document_file}" \
    -w "\n"
else
  # No files: still send multipart with data only
  curl -s -X POST "${base_url}/guards/guards" \
    -H "Authorization: Bearer ${token}" \
    -F "data=${data_json}" \
    -w "\n"
fi
