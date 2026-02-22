#!/bin/bash

# Admin API Testing Script
# Tests each endpoint systematically

API_URL="http://localhost:5000/api"
TOKEN=$(cat backend/.test-token 2>/dev/null || echo "")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Admin Portal API Testing"
echo "========================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

# Get auth token first
echo "Step 1: Getting authentication token..."
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123"}' \
    "$API_URL/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to get auth token${NC}"
    echo "Response: $login_response"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo "$TOKEN" > backend/.test-token
echo ""

# Test Articles
echo "========================================="
echo "Testing Articles API"
echo "========================================="
test_endpoint "GET" "/admin/articles?limit=5" "" "GET /admin/articles"
echo ""

# Test Shows
echo "========================================="
echo "Testing Shows API"
echo "========================================="
test_endpoint "GET" "/admin/shows?limit=5" "" "GET /admin/shows"
echo ""

# Test Episodes
echo "========================================="
echo "Testing Episodes API"
echo "========================================="
test_endpoint "GET" "/admin/episodes?limit=5" "" "GET /admin/episodes"
echo ""

# Test Events
echo "========================================="
echo "Testing Events API"
echo "========================================="
test_endpoint "GET" "/admin/events?limit=5" "" "GET /admin/events"
echo ""

# Test Resources
echo "========================================="
echo "Testing Resources API"
echo "========================================="
test_endpoint "GET" "/admin/resources?limit=5" "" "GET /admin/resources"
echo ""

# Test Dashboard
echo "========================================="
echo "Testing Dashboard API"
echo "========================================="
test_endpoint "GET" "/admin/dashboard/stats" "" "GET /admin/dashboard/stats"
echo ""

echo "========================================="
echo "Test Summary"
echo "========================================="
echo "All basic GET endpoints tested"
echo "Check results above for any failures"
