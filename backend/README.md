# HealthTracker Backend

A Node.js/TypeScript backend API for the HealthTracker mobile web application, featuring AI-powered nutrition analysis, voice transcription, and comprehensive health tracking.

## Features

- 🔐 JWT-based authentication
- 🗄️ Supabase database integration
- 🎙️ Voice transcription with OpenAI Whisper
- 🤖 AI nutrition analysis with Claude
- 📊 Analytics and streak tracking
- 🏃 Workout management
- 🥗 Food entry tracking with automatic nutrition estimation
- ✅ Habit tracking
- 🔒 Row-level security with Supabase
- ⚡ Rate limiting and security middleware

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens with bcrypt
- **AI Services**: 
  - OpenAI Whisper (speech-to-text)
  - Anthropic Claude (nutrition analysis)
- **Validation**: Zod
- **File Upload**: Multer

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key
- Anthropic API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `JWT_SECRET`: Secret key for JWT tokens (generate a secure random string)
- `OPENAI_API_KEY`: OpenAI API key for Whisper
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `supabase/schema.sql`
4. This will create all necessary tables, indexes, and RLS policies

### 4. Run the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/goals` - Get nutrition/fitness goals
- `PUT /api/user/goals` - Update goals
- `POST /api/user/initial-setup` - Complete onboarding

### Habits
- `GET /api/habits` - Get habits with completion status
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:habitId/complete` - Toggle habit completion
- `DELETE /api/habits/:habitId` - Delete habit

### Food Tracking
- `GET /api/food-entries` - Get food entries by date
- `POST /api/food-entries` - Add food with AI nutrition analysis
- `PUT /api/food-entries/:entryId` - Update food entry
- `DELETE /api/food-entries/:entryId` - Delete food entry

### Workouts
- `GET /api/workouts` - Get workouts
- `POST /api/workouts` - Log workout
- `PUT /api/workouts/:workoutId` - Update workout
- `DELETE /api/workouts/:workoutId` - Delete workout

### Analytics
- `GET /api/analytics/streak` - Get activity streak data
- `GET /api/analytics/daily-summary` - Get daily progress summary

### Voice Processing
- `POST /api/voice/transcribe` - Transcribe audio and extract health data
- `POST /api/voice/quick-log` - Process transcription and auto-create entries

## Development Commands

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm start          # Start production server
npm run typecheck  # Run TypeScript type checking
```

## Security Features

- JWT authentication with configurable expiration
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS configuration
- Request validation with Zod
- Row-level security in Supabase

## Rate Limits

- Authentication endpoints: 5 requests/minute
- Voice processing: 10 requests/minute
- Analytics: 20 requests/minute
- General API: 100 requests/minute

## Error Handling

The API uses consistent error responses:

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2024-01-01T12:00:00Z"
}
```

Common error codes:
- `UNAUTHORIZED` - Missing or invalid token
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

## Testing

To test the API:

1. Use the provided Postman collection (coming soon)
2. Or use curl/httpie for manual testing
3. Ensure you include the Authorization header: `Bearer YOUR_JWT_TOKEN`

## Deployment

### Using Docker (Recommended)

```bash
docker build -t healthtracker-backend .
docker run -p 3000:3000 --env-file .env healthtracker-backend
```

### Manual Deployment

1. Build the TypeScript code: `npm run build`
2. Set NODE_ENV=production
3. Run: `npm start`

### Deployment Platforms

The backend is ready for deployment on:
- Railway
- Render
- Fly.io
- Heroku
- AWS/GCP/Azure
- Any VPS with Node.js

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Update API documentation
5. Test your changes thoroughly

## License

MIT