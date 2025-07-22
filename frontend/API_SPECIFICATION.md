# HealthTrack API Specification

## Overview

This document defines the REST API endpoints required for the HealthTrack mobile web application. The backend will be cost-optimized using:

- **Authentication**: JWT tokens (stateless, no session storage needed)
- **Database**: SQLite for development, PostgreSQL for production (cost-effective)
- **Voice Processing**: OpenAI Whisper API integration
- **Nutrition Analysis**: LLM-based calorie/protein estimation from food descriptions

---

## Authentication Endpoints

### POST /api/auth/register
**Purpose**: Create a new user account
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response Success (201)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": null,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "jwt.token.here"
}
```
**Response Error (400)**:
```json
{
  "error": "Email already exists",
  "code": "EMAIL_TAKEN"
}
```

### POST /api/auth/login
**Purpose**: Authenticate existing user
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response Success (200)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": {
      "darkMode": true,
      "notifications": true
    }
  },
  "token": "jwt.token.here"
}
```
**Response Error (401)**:
```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

### POST /api/auth/logout
**Purpose**: Invalidate user session
**Headers**: `Authorization: Bearer {token}`
**Response Success (200)**:
```json
{
  "message": "Successfully logged out"
}
```

---

## User Management Endpoints

### GET /api/user/profile
**Purpose**: Get user profile information
**Headers**: `Authorization: Bearer {token}`
**Response Success (200)**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "preferences": {
    "darkMode": true,
    "notifications": true
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/user/profile
**Purpose**: Update user profile information
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "preferences": {
    "darkMode": false,
    "notifications": true
  }
}
```
**Response Success (200)**:
```json
{
  "id": "uuid",
  "email": "john.smith@example.com",
  "name": "John Smith",
  "preferences": {
    "darkMode": false,
    "notifications": true
  }
}
```

### POST /api/user/initial-setup
**Purpose**: Complete onboarding setup
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "goals": {
    "calorieGoal": 2200,
    "proteinGoal": 180,
    "workoutGoal": 5
  },
  "habits": [
    "Drink 8 glasses of water",
    "10,000 steps daily",
    "Meditate for 10 minutes"
  ]
}
```
**Response Success (200)**:
```json
{
  "message": "Initial setup completed",
  "goalsId": "uuid",
  "habitIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Goals Management Endpoints

### GET /api/user/goals
**Purpose**: Get user's current goals
**Headers**: `Authorization: Bearer {token}`
**Response Success (200)**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "calorieGoal": 2200,
  "proteinGoal": 180,
  "workoutGoal": 5,
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/user/goals
**Purpose**: Update user's goals
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "calorieGoal": 2000,
  "proteinGoal": 150,
  "workoutGoal": 4
}
```
**Response Success (200)**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "calorieGoal": 2000,
  "proteinGoal": 150,
  "workoutGoal": 4,
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

---

## Habits Management Endpoints

### GET /api/habits
**Purpose**: Get user's habits with today's completion status
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**: 
- `date` (optional): YYYY-MM-DD format, defaults to today
**Response Success (200)**:
```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Drink 8 glasses of water",
      "completed": true,
      "completedAt": "2024-01-01T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "name": "Meditate for 10 minutes",
      "completed": false,
      "completedAt": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "date": "2024-01-01"
}
```

### POST /api/habits
**Purpose**: Create a new habit
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "Read for 30 minutes"
}
```
**Response Success (201)**:
```json
{
  "id": "uuid",
  "name": "Read for 30 minutes",
  "completed": false,
  "completedAt": null,
  "createdAt": "2024-01-01T12:00:00Z"
}
```

### PUT /api/habits/{habitId}/complete
**Purpose**: Mark habit as completed for today
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "completed": true
}
```
**Response Success (200)**:
```json
{
  "id": "uuid",
  "name": "Drink 8 glasses of water",
  "completed": true,
  "completedAt": "2024-01-01T15:30:00Z"
}
```

### DELETE /api/habits/{habitId}
**Purpose**: Delete a habit
**Headers**: `Authorization: Bearer {token}`
**Response Success (204)**: No content

---

## Food Logging Endpoints

### GET /api/food-entries
**Purpose**: Get food entries for a specific date
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `date` (optional): YYYY-MM-DD format, defaults to today
**Response Success (200)**:
```json
{
  "entries": [
    {
      "id": "uuid",
      "name": "Oatmeal with berries",
      "calories": 320,
      "protein": 8,
      "meal": "breakfast",
      "timestamp": "2024-01-01T08:00:00Z",
      "description": "Bowl of oatmeal with mixed berries and honey"
    },
    {
      "id": "uuid",
      "name": "Grilled chicken salad",
      "calories": 450,
      "protein": 35,
      "meal": "lunch",
      "timestamp": "2024-01-01T12:30:00Z",
      "description": "Grilled chicken breast with mixed greens and vinaigrette"
    }
  ],
  "totals": {
    "calories": 770,
    "protein": 43
  },
  "date": "2024-01-01"
}
```

### POST /api/food-entries
**Purpose**: Add a new food entry with LLM-based nutrition analysis
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "description": "Large banana and 2 slices of whole wheat toast with peanut butter",
  "meal": "breakfast"
}
```
**Response Success (201)**:
```json
{
  "id": "uuid",
  "name": "Banana and peanut butter toast",
  "calories": 420,
  "protein": 12,
  "meal": "breakfast",
  "timestamp": "2024-01-01T08:15:00Z",
  "description": "Large banana and 2 slices of whole wheat toast with peanut butter",
  "analysisConfidence": 0.85,
  "nutritionBreakdown": {
    "banana": { "calories": 120, "protein": 1 },
    "wholeWheatToast": { "calories": 160, "protein": 6 },
    "peanutButter": { "calories": 140, "protein": 5 }
  }
}
```

### PUT /api/food-entries/{entryId}
**Purpose**: Update a food entry
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "Updated meal name",
  "calories": 400,
  "protein": 15,
  "meal": "lunch"
}
```
**Response Success (200)**:
```json
{
  "id": "uuid",
  "name": "Updated meal name",
  "calories": 400,
  "protein": 15,
  "meal": "lunch",
  "timestamp": "2024-01-01T12:30:00Z",
  "description": "Original description",
  "updatedAt": "2024-01-01T16:00:00Z"
}
```

### DELETE /api/food-entries/{entryId}
**Purpose**: Delete a food entry
**Headers**: `Authorization: Bearer {token}`
**Response Success (204)**: No content

---

## Workout Tracking Endpoints

### GET /api/workouts
**Purpose**: Get workouts for a specific date range
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `date` (optional): YYYY-MM-DD format, defaults to today
- `week` (optional): Get full week, boolean
**Response Success (200)**:
```json
{
  "workouts": [
    {
      "id": "uuid",
      "name": "Morning Run",
      "type": "cardio",
      "duration": 28,
      "calories": 245,
      "completed": true,
      "timestamp": "2024-01-01T07:00:00Z",
      "notes": "5.2 km run in the park"
    },
    {
      "id": "uuid",
      "name": "Strength Training",
      "type": "strength",
      "duration": 45,
      "calories": 180,
      "completed": false,
      "timestamp": "2024-01-01T18:00:00Z",
      "notes": "Upper body workout"
    }
  ],
  "weeklyStats": {
    "totalWorkouts": 3,
    "totalDuration": 140,
    "totalCalories": 680,
    "goalProgress": 0.6
  }
}
```

### POST /api/workouts
**Purpose**: Log a new workout
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "Evening Yoga",
  "type": "flexibility",
  "duration": 30,
  "calories": 90,
  "notes": "Relaxing yoga session"
}
```
**Response Success (201)**:
```json
{
  "id": "uuid",
  "name": "Evening Yoga",
  "type": "flexibility",
  "duration": 30,
  "calories": 90,
  "completed": true,
  "timestamp": "2024-01-01T19:00:00Z",
  "notes": "Relaxing yoga session"
}
```

### PUT /api/workouts/{workoutId}
**Purpose**: Update workout details
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "name": "Updated workout name",
  "duration": 35,
  "calories": 100,
  "completed": true,
  "notes": "Updated notes"
}
```
**Response Success (200)**:
```json
{
  "id": "uuid",
  "name": "Updated workout name",
  "type": "flexibility",
  "duration": 35,
  "calories": 100,
  "completed": true,
  "timestamp": "2024-01-01T19:00:00Z",
  "notes": "Updated notes",
  "updatedAt": "2024-01-01T20:00:00Z"
}
```

### DELETE /api/workouts/{workoutId}
**Purpose**: Delete a workout
**Headers**: `Authorization: Bearer {token}`
**Response Success (204)**: No content

---

## Analytics Endpoints

### GET /api/analytics/streak
**Purpose**: Get activity streak data for heatmap
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `days` (optional): Number of days to retrieve (default: 365)
- `endDate` (optional): YYYY-MM-DD format, defaults to today
**Response Success (200)**:
```json
{
  "streakData": [
    {
      "date": "2024-01-01",
      "value": 3,
      "activities": {
        "foodLogged": true,
        "workoutCompleted": true,
        "habitsCompleted": 3,
        "totalHabits": 5
      }
    },
    {
      "date": "2024-01-02",
      "value": 1,
      "activities": {
        "foodLogged": false,
        "workoutCompleted": false,
        "habitsCompleted": 1,
        "totalHabits": 5
      }
    }
  ],
  "currentStreak": 15,
  "longestStreak": 28,
  "totalActiveDays": 89
}
```

### GET /api/analytics/daily-summary
**Purpose**: Get today's progress summary for dashboard
**Headers**: `Authorization: Bearer {token}`
**Query Parameters**:
- `date` (optional): YYYY-MM-DD format, defaults to today
**Response Success (200)**:
```json
{
  "date": "2024-01-01",
  "nutrition": {
    "caloriesConsumed": 1847,
    "calorieGoal": 2200,
    "proteinConsumed": 145,
    "proteinGoal": 180,
    "mealsLogged": 3
  },
  "workouts": {
    "completed": 1,
    "weeklyGoal": 5,
    "weeklyCompleted": 3,
    "caloriesBurned": 245
  },
  "habits": {
    "completed": 3,
    "total": 5,
    "completedHabits": [
      "Drink 8 glasses of water",
      "10,000 steps",
      "8 hours sleep"
    ],
    "pendingHabits": [
      "Meditation (10 min)",
      "Read (30 min)"
    ]
  }
}
```

---

## Voice Processing Endpoints

### POST /api/voice/transcribe
**Purpose**: Transcribe voice recording and extract actionable health data
**Headers**: `Authorization: Bearer {token}`
**Request Body**: `multipart/form-data`
- `audio`: Audio file (mp3, wav, m4a, webm)
- `context` (optional): Current context ("food", "workout", "habit", "general")
**Response Success (200)**:
```json
{
  "transcription": "I had a grilled chicken salad with quinoa for lunch",
  "extractedData": {
    "type": "food",
    "confidence": 0.92,
    "suggestedEntry": {
      "name": "Grilled chicken salad with quinoa",
      "meal": "lunch",
      "calories": 420,
      "protein": 28,
      "description": "Grilled chicken salad with quinoa"
    }
  },
  "alternatives": [
    {
      "name": "Chicken quinoa bowl",
      "calories": 380,
      "protein": 25
    }
  ]
}
```

### POST /api/voice/quick-log
**Purpose**: Process voice transcription and auto-create appropriate entries
**Headers**: `Authorization: Bearer {token}`
**Request Body**:
```json
{
  "transcription": "I just finished a 30 minute run and had a protein shake",
  "autoCreate": true
}
```
**Response Success (200)**:
```json
{
  "createdEntries": [
    {
      "type": "workout",
      "id": "uuid",
      "name": "Run",
      "duration": 30,
      "calories": 200
    },
    {
      "type": "food",
      "id": "uuid",
      "name": "Protein shake",
      "calories": 150,
      "protein": 25
    }
  ],
  "message": "Created 1 workout and 1 food entry from your voice note"
}
```

---

## Error Response Format

All endpoints use consistent error response format:

```json
{
  "error": "Human readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "field": "Specific field error details"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Valid token but insufficient permissions
- `VALIDATION_ERROR`: Request body validation failed
- `NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Voice processing**: 10 requests per minute per user
- **General API**: 100 requests per minute per user
- **Analytics**: 20 requests per minute per user

---

## Database Schema Considerations

### Cost-Effective Approach
1. **SQLite for development**: Zero hosting cost
2. **PostgreSQL for production**: Use managed service (Railway, Neon, Supabase)
3. **Minimal indexing**: Only on frequently queried fields
4. **Soft deletes**: Use `deletedAt` field instead of hard deletes
5. **Timestamps**: Always include `createdAt` and `updatedAt`

### Key Tables
- `users` - User accounts and preferences
- `user_goals` - Nutrition and fitness goals
- `habits` - User-defined daily habits
- `habit_completions` - Daily habit completion records
- `food_entries` - Meal logging with nutrition data
- `workouts` - Exercise tracking
- `daily_summaries` - Pre-calculated daily metrics for performance

This API specification provides a complete backend blueprint optimized for cost-effectiveness while supporting all frontend features.
