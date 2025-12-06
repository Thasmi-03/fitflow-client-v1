#!/bin/bash

BASE_URL="http://localhost:5000/api"
EMAIL="test_styler_$(date +%s)@example.com"
PASSWORD="password123"

echo "1. Registering new styler..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"styler\",
    \"fullName\": \"Test Styler\",
    \"phone\": \"1234567890\",
    \"address\": \"123 Test St\",
    \"gender\": \"female\",
    \"dateOfBirth\": \"1990-01-01\"
  }")

echo "Register Response: $REGISTER_RESPONSE"

# Extract token (simple grep/sed, assuming json response)
# Note: In a real script we'd use jq, but I don't know if jq is installed.
# Let's try to login to get the token cleanly if register didn't return it (though styler register should)

echo -e "\n2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

# Extract token using python (more reliable than grep)
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token: $TOKEN"

echo -e "\n3. Getting Profile..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo "Profile Response: $PROFILE_RESPONSE"
