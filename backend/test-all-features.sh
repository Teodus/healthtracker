#!/bin/bash

# Health Tracker Backend Feature Test Script
# Tests all backend features systematically

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api"

# Test data
TEST_EMAIL="test_$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="Test User"
JWT_TOKEN=""

# Helper function to print test results
print_test() {
    local test_name=$1
    local status=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ ${test_name}${NC}"
    else
        echo -e "${RED}✗ ${test_name}${NC}"
    fi
}

# Helper function to make authenticated requests
auth_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -z "$data" ]; then
        curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

echo -e "${BLUE}🔧 Health Tracker Backend Feature Test${NC}"
echo "======================================="

# 1. Health Check
echo -e "\n${YELLOW}1. Testing Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    print_test "Health check endpoint" "PASS"
else
    print_test "Health check endpoint" "FAIL"
    exit 1
fi

# 2. User Registration
echo -e "\n${YELLOW}2. Testing User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}")

if echo "$REGISTER_RESPONSE" | grep -q '"token"'; then
    print_test "User registration" "PASS"
    JWT_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
else
    print_test "User registration" "FAIL"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

# 3. User Login
echo -e "\n${YELLOW}3. Testing User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    print_test "User login" "PASS"
else
    print_test "User login" "FAIL"
    exit 1
fi

# 4. Get User Profile
echo -e "\n${YELLOW}4. Testing User Profile${NC}"
PROFILE_RESPONSE=$(auth_request GET "/user/profile")
if echo "$PROFILE_RESPONSE" | grep -q "$TEST_EMAIL"; then
    print_test "Get user profile" "PASS"
else
    print_test "Get user profile" "FAIL"
    exit 1
fi

# 5. Set User Goals
echo -e "\n${YELLOW}5. Testing User Goals${NC}"
GOALS_DATA='{
    "daily_calories": 2000,
    "daily_protein": 150,
    "weekly_workouts": 4
}'
GOALS_RESPONSE=$(auth_request PUT "/user/goals" "$GOALS_DATA")
if echo "$GOALS_RESPONSE" | grep -q '"daily_calories":2000'; then
    print_test "Set user goals" "PASS"
else
    print_test "Set user goals" "FAIL"
fi

# 6. Create Food Entry via AI
echo -e "\n${YELLOW}6. Testing Food Entry Creation (AI)${NC}"
FOOD_DATA='{
    "description": "grilled salmon with quinoa and steamed broccoli, about 550 calories"
}'
FOOD_RESPONSE=$(auth_request POST "/food-entries" "$FOOD_DATA")
if echo "$FOOD_RESPONSE" | grep -q '"name"'; then
    print_test "Create food entry with AI" "PASS"
    FOOD_ID=$(echo "$FOOD_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
else
    print_test "Create food entry with AI" "FAIL"
fi

# 7. Get Food Entries
echo -e "\n${YELLOW}7. Testing Get Food Entries${NC}"
FOOD_LIST_RESPONSE=$(auth_request GET "/food-entries")
if echo "$FOOD_LIST_RESPONSE" | grep -q '"entries"'; then
    print_test "Get food entries" "PASS"
else
    print_test "Get food entries" "FAIL"
fi

# 8. Create Workout
echo -e "\n${YELLOW}8. Testing Workout Creation${NC}"
WORKOUT_DATA='{
    "name": "Evening Yoga",
    "type": "flexibility",
    "duration": 60,
    "calories": 200,
    "notes": "Relaxing yoga session"
}'
WORKOUT_RESPONSE=$(auth_request POST "/workouts" "$WORKOUT_DATA")
if echo "$WORKOUT_RESPONSE" | grep -q '"name":"Evening Yoga"'; then
    print_test "Create workout" "PASS"
    WORKOUT_ID=$(echo "$WORKOUT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
else
    print_test "Create workout" "FAIL"
fi

# 9. Get Workouts
echo -e "\n${YELLOW}9. Testing Get Workouts${NC}"
WORKOUT_LIST_RESPONSE=$(auth_request GET "/workouts")
if echo "$WORKOUT_LIST_RESPONSE" | grep -q '"workouts"'; then
    print_test "Get workouts" "PASS"
else
    print_test "Get workouts" "FAIL"
fi

# 10. Create Habit
echo -e "\n${YELLOW}10. Testing Habit Creation${NC}"
HABIT_DATA='{
    "name": "Read for 30 minutes",
    "description": "Daily reading habit",
    "frequency": "daily"
}'
HABIT_RESPONSE=$(auth_request POST "/habits" "$HABIT_DATA")
if echo "$HABIT_RESPONSE" | grep -q '"name":"Read for 30 minutes"'; then
    print_test "Create habit" "PASS"
    HABIT_ID=$(echo "$HABIT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
else
    print_test "Create habit" "FAIL"
fi

# 11. Get Habits
echo -e "\n${YELLOW}11. Testing Get Habits${NC}"
HABITS_RESPONSE=$(auth_request GET "/habits")
if echo "$HABITS_RESPONSE" | grep -q "Read for 30 minutes"; then
    print_test "Get habits" "PASS"
else
    print_test "Get habits" "FAIL"
fi

# 12. Toggle Habit Completion
echo -e "\n${YELLOW}12. Testing Habit Completion${NC}"
if [ ! -z "$HABIT_ID" ]; then
    COMPLETE_DATA='{"completed": true}'
    COMPLETE_RESPONSE=$(auth_request PUT "/habits/$HABIT_ID/complete" "$COMPLETE_DATA")
    if echo "$COMPLETE_RESPONSE" | grep -q '"completed":true'; then
        print_test "Toggle habit completion" "PASS"
    else
        print_test "Toggle habit completion" "FAIL"
    fi
else
    print_test "Toggle habit completion" "SKIP"
fi

# 13. Test Voice/Text Processing (Multiple Items)
echo -e "\n${YELLOW}13. Testing Multi-Item Text Processing${NC}"
VOICE_DATA='{
    "transcription": "For breakfast I had scrambled eggs with toast about 400 calories. Did a 30 minute jog this morning. For lunch had a chicken caesar salad. Also completed my meditation and water intake habits today.",
    "autoCreate": true
}'
VOICE_RESPONSE=$(auth_request POST "/voice/quick-log" "$VOICE_DATA")
if echo "$VOICE_RESPONSE" | grep -q '"createdEntries"'; then
    print_test "Multi-item text processing" "PASS"
else
    print_test "Multi-item text processing" "FAIL"
fi

# 14. Get Analytics/Streak
echo -e "\n${YELLOW}14. Testing Analytics/Streak${NC}"
ANALYTICS_RESPONSE=$(auth_request GET "/analytics/streak")
if echo "$ANALYTICS_RESPONSE" | grep -q '"streakData"'; then
    print_test "Get streak analytics" "PASS"
else
    print_test "Get streak analytics" "FAIL"
fi

# 15. Update Food Entry
echo -e "\n${YELLOW}15. Testing Update Food Entry${NC}"
if [ ! -z "$FOOD_ID" ]; then
    UPDATE_FOOD_DATA='{"calories": 600, "protein": 45}'
    UPDATE_FOOD_RESPONSE=$(auth_request PUT "/food-entries/$FOOD_ID" "$UPDATE_FOOD_DATA")
    if echo "$UPDATE_FOOD_RESPONSE" | grep -q '"calories":600'; then
        print_test "Update food entry" "PASS"
    else
        print_test "Update food entry" "FAIL"
    fi
else
    print_test "Update food entry" "SKIP"
fi

# 16. Delete Food Entry
echo -e "\n${YELLOW}16. Testing Delete Food Entry${NC}"
if [ ! -z "$FOOD_ID" ]; then
    DELETE_RESPONSE=$(auth_request DELETE "/food-entries/$FOOD_ID")
    # Check if we can still get the deleted entry
    CHECK_RESPONSE=$(auth_request GET "/food-entries")
    if ! echo "$CHECK_RESPONSE" | grep -q "$FOOD_ID"; then
        print_test "Delete food entry" "PASS"
    else
        print_test "Delete food entry" "FAIL"
    fi
else
    print_test "Delete food entry" "SKIP"
fi

# 17. Delete Workout
echo -e "\n${YELLOW}17. Testing Delete Workout${NC}"
if [ ! -z "$WORKOUT_ID" ]; then
    DELETE_WORKOUT_RESPONSE=$(auth_request DELETE "/workouts/$WORKOUT_ID")
    CHECK_WORKOUT_RESPONSE=$(auth_request GET "/workouts")
    if ! echo "$CHECK_WORKOUT_RESPONSE" | grep -q "$WORKOUT_ID"; then
        print_test "Delete workout" "PASS"
    else
        print_test "Delete workout" "FAIL"
    fi
else
    print_test "Delete workout" "SKIP"
fi

# 18. Delete Habit
echo -e "\n${YELLOW}18. Testing Delete Habit${NC}"
if [ ! -z "$HABIT_ID" ]; then
    DELETE_HABIT_RESPONSE=$(auth_request DELETE "/habits/$HABIT_ID")
    CHECK_HABIT_RESPONSE=$(auth_request GET "/habits")
    if ! echo "$CHECK_HABIT_RESPONSE" | grep -q "$HABIT_ID"; then
        print_test "Delete habit" "PASS"
    else
        print_test "Delete habit" "FAIL"
    fi
else
    print_test "Delete habit" "SKIP"
fi

# 19. Test Date Filtering
echo -e "\n${YELLOW}19. Testing Date Filtering${NC}"
TODAY=$(date +%Y-%m-%d)
DATE_FOOD_RESPONSE=$(auth_request GET "/food-entries?date=$TODAY")
DATE_WORKOUT_RESPONSE=$(auth_request GET "/workouts?date=$TODAY")
if echo "$DATE_FOOD_RESPONSE" | grep -q '"date"' && echo "$DATE_WORKOUT_RESPONSE" | grep -q "workouts"; then
    print_test "Date filtering" "PASS"
else
    print_test "Date filtering" "FAIL"
fi

# 20. Test Error Handling
echo -e "\n${YELLOW}20. Testing Error Handling${NC}"
# Test invalid authentication
INVALID_AUTH=$(curl -s -X GET "$BASE_URL/food-entries" -H "Authorization: Bearer invalid_token")
if echo "$INVALID_AUTH" | grep -q '"error"'; then
    print_test "Invalid auth handling" "PASS"
else
    print_test "Invalid auth handling" "FAIL"
fi

# Test validation error
INVALID_FOOD=$(auth_request POST "/food-entries" '{"invalid": "data"}')
if echo "$INVALID_FOOD" | grep -q '"error"'; then
    print_test "Validation error handling" "PASS"
else
    print_test "Validation error handling" "FAIL"
fi

echo -e "\n${BLUE}=======================================${NC}"
echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${BLUE}=======================================${NC}"