#!/bin/bash

echo "=== Testing Immediate Retrieval After Creation ==="
echo ""

# Login
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@resistanceradio.org","password":"admin123"}' \
  | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to authenticate"
  exit 1
fi
echo "✓ Authenticated"
echo ""

# Create a new article
TIMESTAMP=$(date +%s)
TITLE="Test Article $TIMESTAMP"
SLUG="test-article-$TIMESTAMP"

echo "2. Creating article: $TITLE"
CREATE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/admin/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"$TITLE\",
    \"slug\": \"$SLUG\",
    \"content\": \"Test content for immediate retrieval test\",
    \"excerpt\": \"Test excerpt\",
    \"author\": \"Test Author\",
    \"category\": \"news\",
    \"status\": \"draft\"
  }")

echo "Create response:"
echo "$CREATE_RESPONSE" | jq '{id, title, author, status}'

ARTICLE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')

if [ "$ARTICLE_ID" = "null" ] || [ -z "$ARTICLE_ID" ]; then
  echo "❌ Failed to create article"
  echo "Full response: $CREATE_RESPONSE"
  exit 1
fi

echo "✓ Article created with ID: $ARTICLE_ID"
echo ""

# Immediately retrieve the article by ID
echo "3. Retrieving article by ID immediately..."
GET_BY_ID=$(curl -s "http://localhost:5000/api/admin/articles/$ARTICLE_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Get by ID response:"
echo "$GET_BY_ID" | jq '{id, title, author, status}'
echo ""

# Immediately retrieve the articles list
echo "4. Retrieving articles list immediately..."
GET_LIST=$(curl -s "http://localhost:5000/api/admin/articles?limit=5&sort=created_at&order=DESC" \
  -H "Authorization: Bearer $TOKEN")

echo "Articles list (top 5):"
echo "$GET_LIST" | jq '.articles[] | {id, title, author, created_at}'
echo ""

# Check if our article is in the list
FOUND=$(echo "$GET_LIST" | jq ".articles[] | select(.id == $ARTICLE_ID)")

if [ -z "$FOUND" ]; then
  echo "❌ ISSUE: Article NOT found in list immediately after creation!"
  echo ""
  echo "Expected ID: $ARTICLE_ID"
  echo "Articles in list:"
  echo "$GET_LIST" | jq '.articles[].id'
else
  echo "✓ SUCCESS: Article found in list immediately after creation"
  echo "$FOUND" | jq '{id, title, author}'
fi

echo ""
echo "=== Test Complete ==="
