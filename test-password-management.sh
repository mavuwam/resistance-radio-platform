#!/bin/bash

# Admin Password Management - Comprehensive Test Script
# This script tests all password management endpoints

# Note: We don't use 'set -e' because we expect some tests to return non-200 status codes

API_URL="${API_URL:-http://localhost:5000/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"

echo "========================================="
echo "Admin Password Management - API Tests"
echo "========================================="
echo ""
echo "API URL: $API_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

# Function to print section header
print_section() {
    echo ""
    echo "========================================="
    echo "$1"
    echo "========================================="
    echo ""
}

# Step 1: Login to get JWT token
print_section "1. Authentication Test"
echo "Logging in as admin..."

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    echo -e "${RED}✗ FAIL${NC}: Failed to obtain JWT token"
    echo "Response: $LOGIN_RESPONSE"
    echo ""
    echo "Please ensure:"
    echo "1. Backend server is running on port 5000"
    echo "2. Database is running and migrated"
    echo "3. Admin user exists with email: $ADMIN_EMAIL"
    echo ""
    exit 1
fi

print_result 0 "Successfully obtained JWT token"

# Step 2: Test Change Password (with incorrect current password)
print_section "2. Change Password - Invalid Current Password Test"

CHANGE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/change" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"currentPassword":"WrongPassword123!","newPassword":"NewPassword123!"}')

HTTP_CODE=$(echo "$CHANGE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CHANGE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "Correctly rejected incorrect current password (401)"
else
    print_result 1 "Expected 401, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Step 3: Test Change Password (with weak new password)
print_section "3. Change Password - Weak Password Test"

CHANGE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/change" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{\"currentPassword\":\"$ADMIN_PASSWORD\",\"newPassword\":\"weak\"}")

HTTP_CODE=$(echo "$CHANGE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CHANGE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
    print_result 0 "Correctly rejected weak password (400)"
else
    print_result 1 "Expected 400, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Step 4: Test Password Reset Request (valid email)
print_section "4. Password Reset Request - Valid Email Test"

RESET_REQUEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/reset/request" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\"}")

HTTP_CODE=$(echo "$RESET_REQUEST_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESET_REQUEST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    print_result 0 "Password reset request accepted (200)"
    if echo "$RESPONSE_BODY" | grep -q "If an account exists"; then
        print_result 0 "Generic success message returned (email enumeration prevention)"
    else
        print_result 1 "Expected generic success message"
        echo "Response: $RESPONSE_BODY"
    fi
else
    print_result 1 "Expected 200, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Step 5: Test Password Reset Request (invalid email format)
print_section "5. Password Reset Request - Invalid Email Format Test"

RESET_REQUEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/reset/request" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}')

HTTP_CODE=$(echo "$RESET_REQUEST_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESET_REQUEST_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
    print_result 0 "Correctly rejected invalid email format (400)"
else
    print_result 1 "Expected 400, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Step 6: Test Rate Limiting
print_section "6. Rate Limiting Test (3 requests per 15 minutes)"

echo "Sending 4 consecutive password reset requests..."

for i in {1..4}; do
    RESET_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/reset/request" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"test$i@example.com\"}")
    
    HTTP_CODE=$(echo "$RESET_RESPONSE" | tail -n1)
    
    if [ $i -le 3 ]; then
        if [ "$HTTP_CODE" = "200" ]; then
            echo "  Request $i: Accepted (200)"
        else
            echo "  Request $i: Unexpected status $HTTP_CODE"
        fi
    else
        if [ "$HTTP_CODE" = "429" ]; then
            print_result 0 "Rate limit enforced on 4th request (429)"
            RESPONSE_BODY=$(echo "$RESET_RESPONSE" | sed '$d')
            if echo "$RESPONSE_BODY" | grep -q "retryAfter"; then
                print_result 0 "Rate limit response includes retryAfter"
            else
                print_result 1 "Rate limit response missing retryAfter"
                echo "Response: $RESPONSE_BODY"
            fi
        else
            print_result 1 "Expected 429 on 4th request, got $HTTP_CODE"
        fi
    fi
    
    sleep 0.5
done

# Step 7: Test Password Reset Complete (invalid token)
print_section "7. Password Reset Complete - Invalid Token Test"

RESET_COMPLETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/reset/complete" \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token-12345","newPassword":"NewPassword123!"}')

HTTP_CODE=$(echo "$RESET_COMPLETE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESET_COMPLETE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
    print_result 0 "Correctly rejected invalid token (400)"
else
    print_result 1 "Expected 400, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Step 8: Test Password Reset Complete (weak password)
print_section "8. Password Reset Complete - Weak Password Test"

RESET_COMPLETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/reset/complete" \
  -H "Content-Type: application/json" \
  -d '{"token":"some-token","newPassword":"weak"}')

HTTP_CODE=$(echo "$RESET_COMPLETE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESET_COMPLETE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "400" ]; then
    print_result 0 "Correctly rejected weak password (400)"
else
    print_result 1 "Expected 400, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Step 9: Test Change Password (without authentication)
print_section "9. Change Password - No Authentication Test"

CHANGE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/admin/password/change" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Test123!","newPassword":"NewTest123!"}')

HTTP_CODE=$(echo "$CHANGE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$CHANGE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "401" ]; then
    print_result 0 "Correctly rejected unauthenticated request (401)"
else
    print_result 1 "Expected 401, got $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
fi

# Print summary
print_section "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================="
    echo "✓ ALL TESTS PASSED - READY FOR PRODUCTION"
    echo "=========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================="
    echo "✗ SOME TESTS FAILED - REVIEW REQUIRED"
    echo "=========================================${NC}"
    exit 1
fi
