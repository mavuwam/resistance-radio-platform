#!/bin/bash

# Admin CRUD API Test Script
# Tests PUT and DELETE operations for all admin resources

API_URL="http://localhost:5000/api"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Admin CRUD API Test Script"
echo "========================================="
echo ""

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        echo "Response: $3"
    fi
}

# Get auth token
echo "Step 1: Getting authentication token..."
read -p "Enter admin email: " ADMIN_EMAIL
read -sp "Enter admin password: " ADMIN_PASSWORD
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get authentication token${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo ""

# Test Articles
echo "========================================="
echo "Testing Articles API"
echo "========================================="

# Create test article
echo "Creating test article..."
CREATE_ARTICLE=$(curl -s -X POST "$API_URL/admin/articles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Article for CRUD",
    "content": "This is a test article content",
    "author_name": "Test Author",
    "category": "test",
    "status": "draft"
  }')

ARTICLE_ID=$(echo $CREATE_ARTICLE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ARTICLE_ID" ]; then
    echo -e "${RED}Failed to create test article${NC}"
    echo "Response: $CREATE_ARTICLE"
else
    echo -e "${GREEN}✓ Created article with ID: $ARTICLE_ID${NC}"
    
    # Test PUT
    echo "Testing PUT /admin/articles/$ARTICLE_ID..."
    UPDATE_ARTICLE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/admin/articles/$ARTICLE_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "title": "Updated Test Article",
        "content": "Updated content"
      }')
    
    HTTP_CODE=$(echo "$UPDATE_ARTICLE" | tail -n1)
    RESPONSE=$(echo "$UPDATE_ARTICLE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "PUT /admin/articles/$ARTICLE_ID"
    else
        print_result 1 "PUT /admin/articles/$ARTICLE_ID (HTTP $HTTP_CODE)" "$RESPONSE"
    fi
    
    # Test DELETE
    echo "Testing DELETE /admin/articles/$ARTICLE_ID..."
    DELETE_ARTICLE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/admin/articles/$ARTICLE_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$DELETE_ARTICLE" | tail -n1)
    
    if [ "$HTTP_CODE" = "204" ]; then
        print_result 0 "DELETE /admin/articles/$ARTICLE_ID"
    else
        print_result 1 "DELETE /admin/articles/$ARTICLE_ID (HTTP $HTTP_CODE)"
    fi
fi

echo ""

# Test Shows
echo "========================================="
echo "Testing Shows API"
echo "========================================="

echo "Creating test show..."
CREATE_SHOW=$(curl -s -X POST "$API_URL/admin/shows" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Show for CRUD",
    "description": "Test show description",
    "host_name": "Test Host",
    "category": "test",
    "is_active": true
  }')

SHOW_ID=$(echo $CREATE_SHOW | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$SHOW_ID" ]; then
    echo -e "${RED}Failed to create test show${NC}"
else
    echo -e "${GREEN}✓ Created show with ID: $SHOW_ID${NC}"
    
    # Test PUT
    echo "Testing PUT /admin/shows/$SHOW_ID..."
    UPDATE_SHOW=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/admin/shows/$SHOW_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "title": "Updated Test Show"
      }')
    
    HTTP_CODE=$(echo "$UPDATE_SHOW" | tail -n1)
    RESPONSE=$(echo "$UPDATE_SHOW" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "PUT /admin/shows/$SHOW_ID"
    else
        print_result 1 "PUT /admin/shows/$SHOW_ID (HTTP $HTTP_CODE)" "$RESPONSE"
    fi
    
    # Test DELETE
    echo "Testing DELETE /admin/shows/$SHOW_ID..."
    DELETE_SHOW=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/admin/shows/$SHOW_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$DELETE_SHOW" | tail -n1)
    
    if [ "$HTTP_CODE" = "204" ]; then
        print_result 0 "DELETE /admin/shows/$SHOW_ID"
    else
        print_result 1 "DELETE /admin/shows/$SHOW_ID (HTTP $HTTP_CODE)"
    fi
fi

echo ""

# Test Events
echo "========================================="
echo "Testing Events API"
echo "========================================="

echo "Creating test event..."
CREATE_EVENT=$(curl -s -X POST "$API_URL/admin/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Event for CRUD",
    "description": "Test event description",
    "event_date": "2026-12-31T18:00:00Z",
    "location": "Test Location",
    "event_type": "workshop"
  }')

EVENT_ID=$(echo $CREATE_EVENT | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$EVENT_ID" ]; then
    echo -e "${RED}Failed to create test event${NC}"
else
    echo -e "${GREEN}✓ Created event with ID: $EVENT_ID${NC}"
    
    # Test PUT
    echo "Testing PUT /admin/events/$EVENT_ID..."
    UPDATE_EVENT=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/admin/events/$EVENT_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "title": "Updated Test Event"
      }')
    
    HTTP_CODE=$(echo "$UPDATE_EVENT" | tail -n1)
    RESPONSE=$(echo "$UPDATE_EVENT" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "PUT /admin/events/$EVENT_ID"
    else
        print_result 1 "PUT /admin/events/$EVENT_ID (HTTP $HTTP_CODE)" "$RESPONSE"
    fi
    
    # Test DELETE
    echo "Testing DELETE /admin/events/$EVENT_ID..."
    DELETE_EVENT=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/admin/events/$EVENT_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$DELETE_EVENT" | tail -n1)
    
    if [ "$HTTP_CODE" = "204" ]; then
        print_result 0 "DELETE /admin/events/$EVENT_ID"
    else
        print_result 1 "DELETE /admin/events/$EVENT_ID (HTTP $HTTP_CODE)"
    fi
fi

echo ""

# Test Resources
echo "========================================="
echo "Testing Resources API"
echo "========================================="

echo "Creating test resource..."
CREATE_RESOURCE=$(curl -s -X POST "$API_URL/admin/resources" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Resource for CRUD",
    "description": "Test resource description",
    "file_url": "https://example.com/test.pdf",
    "file_type": "pdf",
    "file_size": 1024,
    "category": "test"
  }')

RESOURCE_ID=$(echo $CREATE_RESOURCE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$RESOURCE_ID" ]; then
    echo -e "${RED}Failed to create test resource${NC}"
    echo "Response: $CREATE_RESOURCE"
else
    echo -e "${GREEN}✓ Created resource with ID: $RESOURCE_ID${NC}"
    
    # Test PUT
    echo "Testing PUT /admin/resources/$RESOURCE_ID..."
    UPDATE_RESOURCE=$(curl -s -w "\n%{http_code}" -X PUT "$API_URL/admin/resources/$RESOURCE_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "title": "Updated Test Resource",
        "file_type": "docx"
      }')
    
    HTTP_CODE=$(echo "$UPDATE_RESOURCE" | tail -n1)
    RESPONSE=$(echo "$UPDATE_RESOURCE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        print_result 0 "PUT /admin/resources/$RESOURCE_ID"
    else
        print_result 1 "PUT /admin/resources/$RESOURCE_ID (HTTP $HTTP_CODE)" "$RESPONSE"
    fi
    
    # Test DELETE
    echo "Testing DELETE /admin/resources/$RESOURCE_ID..."
    DELETE_RESOURCE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/admin/resources/$RESOURCE_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE=$(echo "$DELETE_RESOURCE" | tail -n1)
    
    if [ "$HTTP_CODE" = "204" ]; then
        print_result 0 "DELETE /admin/resources/$RESOURCE_ID"
    else
        print_result 1 "DELETE /admin/resources/$RESOURCE_ID (HTTP $HTTP_CODE)"
    fi
fi

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo "All CRUD tests completed!"
echo "Check the results above for any failures."
