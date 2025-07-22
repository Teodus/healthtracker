# MVP Test Guide - Voice-Powered Health Tracking

## 🎉 MVP Complete!

The app now has full voice and text input capabilities with real-time UI updates!

## Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

The backend will start on http://localhost:3001

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```

The app will open at http://localhost:5173

### 3. Create an Account
1. Open the app in your browser (preferably on mobile or mobile view)
2. Click "Create Account"
3. Enter your name, email, and password
4. You'll be redirected to the goals setup (you can skip for now by navigating to home)

### 4. Test Voice Recording
1. On the home screen, tap the microphone button
2. Allow microphone permissions when prompted
3. Speak naturally about your day, for example:
   - "I had a chicken salad for lunch with about 400 calories"
   - "I went for a 30 minute run this morning"
   - "I completed my meditation habit today"
   - "I ate 2 eggs and toast for breakfast, then did 20 pushups"

4. Tap the microphone button again to stop recording
5. Wait for the AI to process your voice note
6. You'll see a toast notification showing what was detected

## What's Working in MVP

✅ **Voice Recording & Transcription**
- Records audio from your microphone
- Sends to OpenAI Whisper for transcription
- Shows recording duration and visual feedback

✅ **AI Understanding**
- Claude AI analyzes your natural language
- Automatically detects food, workouts, and habits
- Extracts nutrition info and exercise details

✅ **Text Input Processing**
- Type naturally in the quick log box
- AI processes text just like voice
- Press Enter to submit

✅ **Real-Time Dashboard Updates**
- Calories and protein intake update instantly
- Workouts appear as you log them
- Habits can be checked off
- All data persists in the database

✅ **Authentication**
- Secure login/signup with JWT tokens
- Protected routes
- Session persistence

## Environment Requirements

Make sure your backend `.env` file has:
```
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
```

## Mobile App Experience

For the best experience:
1. Use Chrome DevTools mobile view (iPhone 12 Pro recommended)
2. Or access from your actual mobile device on the same network
3. The UI is optimized for mobile with:
   - Bottom navigation
   - Large touch targets
   - Swipeable panels
   - Mobile-first design

## Troubleshooting

**"Cannot connect to server"**
- Make sure backend is running on port 3001
- Check that frontend `.env` has `VITE_API_URL=http://localhost:3001/api`

**"Microphone permission denied"**
- Click the lock icon in your browser's address bar
- Allow microphone permissions for localhost

**"No speech detected"**
- Speak clearly and ensure your microphone is working
- Try a longer recording (at least 2-3 seconds)

## Example Voice/Text Inputs

Try these natural language inputs:

**Food:**
- "I had scrambled eggs and toast for breakfast"
- "Just ate a chicken caesar salad for lunch, probably 500 calories"
- "Had a protein shake with banana, about 30g protein"

**Workouts:**
- "I went for a 30 minute run this morning"
- "Just finished a 45 minute gym session"
- "Did 20 minutes of yoga"

**Combined:**
- "Had oatmeal for breakfast then went to the gym for an hour"
- "Ate a turkey sandwich and did 30 pushups"

**Habits:**
- "I completed my meditation today"
- "Drank all my water"
- "Finished my daily reading"

## Features Highlights

1. **Smart Calorie & Protein Tracking**
   - AI estimates nutrition from food descriptions
   - Running totals update in real-time
   - Progress bars show daily goals

2. **Automatic Meal Classification**
   - Detects breakfast, lunch, dinner, or snack
   - Groups food entries by meal type

3. **Exercise Calorie Burn**
   - Estimates calories burned from activities
   - Shows net calories (intake - burned)

4. **Habit Tracking**
   - Click habits to toggle completion
   - Visual feedback with checkmarks
   - Daily reset for fresh tracking