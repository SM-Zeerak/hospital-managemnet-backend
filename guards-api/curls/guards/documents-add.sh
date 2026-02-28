#!/bin/bash

# Add documents to a guard (upload files; backend stores url + publicId + name)
# POST /api/v1/guards/guards/:id/documents
# Multipart: document or documents (files), optional documentDate, expireDate, documentName

base_url="${base_url:-http://localhost:4002/api/v1}"
token="${TENANT_API_TOKEN}"
guard_id="${GUARD_ID:-}"

if [ -z "$guard_id" ]; then
  echo "Usage: GUARD_ID=<uuid> ./documents-add.sh"
  echo "Optional: DOCUMENT_FILE=/path/to/file.pdf DOCUMENT_DATE=2025-01-01 EXPIRE_DATE=2026-01-01"
  exit 1
fi

document_file="${DOCUMENT_FILE:-}"
document_date="${DOCUMENT_DATE:-2025-01-01}"
expire_date="${EXPIRE_DATE:-2026-01-01}"
document_name="${DOCUMENT_NAME:-}"

if [ -z "$document_file" ] || [ ! -f "$document_file" ]; then
  echo "Set DOCUMENT_FILE to a valid file path, e.g. export DOCUMENT_FILE=/path/to/license.pdf"
  exit 1
fi

curl -s -X POST "${base_url}/guards/guards/${guard_id}/documents" \
  -H "Authorization: Bearer ${token}" \
  -F "document=@${document_file}" \
  -F "documentDate=${document_date}" \
  -F "expireDate=${expire_date}" \
  -F "documentName=${document_name}" \
  -w "\n"
