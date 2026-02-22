#!/bin/bash

# Measure API latency for create and delete operations
# Usage: ./measure-api-latency.sh

API_URL="http://localhost:5000/api"
ADMIN_EMAIL="admin@resistanceradio.org"
ADMIN_PASSWORD="admin123"

# Function to get time in milliseconds (macOS compatible)
get_time_ms() {
  python3 -c 'import time; print(int(time.time() * 1000))'
}

echo "=== API Latency Measurement ==="
echo ""

# Login and get token
echo "1. Logging in..."
LOGIN_START=$(get_time_ms)
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
LOGIN_END=$(get_time_ms)
LOGIN_TIME=$((LOGIN_END - LOGIN_START))

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Login failed with status $HTTP_CODE"
  echo "$RESPONSE_BODY"
  exit 1
fi

TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Login successful (${LOGIN_TIME}ms)"
echo ""

# Test Article Create
echo "2. Creating test article..."
CREATE_START=$(get_time_ms)
CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Latency Test Article",
    "slug": "latency-test-article-'$(date +%s)'",
    "content": "This is a test article for measuring API latency",
    "author": "Test Admin",
    "status": "draft"
  }')
CREATE_END=$(get_time_ms)
CREATE_TIME=$((CREATE_END - CREATE_START))

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "201" ]; then
  echo "❌ Create failed with status $HTTP_CODE"
  echo "$RESPONSE_BODY"
  exit 1
fi

ARTICLE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Article created (ID: $ARTICLE_ID) - ${CREATE_TIME}ms"
echo ""

# Test Article Delete
echo "3. Deleting test article..."
DELETE_START=$(get_time_ms)
DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/admin/articles/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN")
DELETE_END=$(get_time_ms)
DELETE_TIME=$((DELETE_END - DELETE_START))

HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" != "204" ]; then
  echo "❌ Delete failed with status $HTTP_CODE"
  echo "$DELETE_RESPONSE"
  exit 1
fi

echo "✅ Article deleted - ${DELETE_TIME}ms"
echo ""

# Summary
echo "=== Latency Summary ==="
echo "Login:  ${LOGIN_TIME}ms"
echo "Create: ${CREATE_TIME}ms"
echo "Delete: ${DELETE_TIME}ms"
echo ""
echo "Total round-trip time: $((LOGIN_TIME + CREATE_TIME + DELETE_TIME))ms"
