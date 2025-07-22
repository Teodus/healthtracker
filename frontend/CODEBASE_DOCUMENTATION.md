# HealthTrack Frontend Codebase Documentation

## Project Overview

**HealthTrack** (branded as "TracKtical") is a React-based health tracking mobile web application that allows users to monitor their fitness goals, nutrition, workouts, and daily habits. The app features a modern, swipeable interface optimized for mobile devices.

### Tech Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Shadcn/UI** + **Radix UI** for components
- **Tailwind CSS** for styling
- **Lucide React** for icons

---

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main app layout wrapper
│   ├── BottomNav.tsx    # Bottom navigation component
│   └── ui/              # Shadcn/UI component library
├── pages/               # Page components for routing
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── App.tsx              # Main app component with routing
├── main.tsx             # React app entry point
└── index.css            # Global styles
```

---

## Core Application Files

### `src/main.tsx`
**Purpose**: React application entry point
- Renders the main `App` component
- Mounts to the DOM element with id "root"

### `src/App.tsx`
**Purpose**: Main application component with routing and providers
- Sets up React Query client for data fetching
- Configures routing with React Router
- Provides app-wide context (Tooltip, Toast)
- Defines all application routes:
  - `/` → Home page
  - `/auth` → Authentication/onboarding
  - `/goals` → Goals and habits management
  - `/profile` → User profile and settings
- Includes bottom navigation for mobile experience

### `src/components/Layout.tsx`
**Purpose**: Global layout wrapper component
- Provides consistent background styling
- Contains the main content area
- Includes toast notification container
- Sets up base typography and theming

### `src/components/BottomNav.tsx`
**Purpose**: Mobile-first bottom navigation
- Fixed position bottom navigation bar
- Icons for Home, Goals, and Profile pages
- Active state highlighting
- Uses Lucide React icons (Home, Target, User)
- Responsive design with backdrop blur effect

---

## Page Components

### `src/pages/Home.tsx`
**Purpose**: Main dashboard with health metrics overview
**Key Features**:
- **Swipeable panels** displaying different health metrics
- **Streak heatmap** showing user activity over time
- **Voice recording button** for quick logging
- **Quick text input** for manual logging
- **Five main panels**:
  1. **Today's Progress**: Calories, protein, workouts, habits overview
  2. **Food Log**: Meal entries with calorie counts
  3. **Workouts**: Exercise tracking with completion status
  4. **Habits**: Daily habit checklist
  5. **Trends**: Placeholder for analytics/charts

**Backend Integration Points**:
- User daily metrics (calories, protein, workouts, habits)
- Food log entries with nutritional data
- Workout records with performance metrics
- Habit completion tracking
- Historical data for streak visualization
- Voice transcription service for quick logging

### `src/pages/Goals.tsx`
**Purpose**: Goal setting and habit management interface
**Key Features**:
- **Nutrition goals**: Daily calorie and protein targets
- **Workout goals**: Weekly exercise frequency
- **Custom habit management**: Add/remove daily habits
- **Goal persistence**: Save button for updating targets

**Backend Integration Points**:
- User goal preferences storage
- Habit CRUD operations
- Goal progress tracking and analytics

### `src/pages/Profile.tsx`
**Purpose**: User profile and application settings
**Key Features**:
- **Profile information**: Name and email editing
- **App settings**: Dark mode toggle, notifications
- **Account actions**: Sign out functionality
- **App information**: Version display

**Backend Integration Points**:
- User profile data management
- Authentication/session management
- User preference storage
- Theme and notification settings

### `src/pages/Auth.tsx`
**Purpose**: Authentication and user onboarding flow
**Key Features**:
- **Login/Signup forms**: Email and password authentication
- **Three-step onboarding**:
  1. Nutrition goals setup
  2. Workout preferences
  3. Custom habit creation
- **Progress indicator**: Visual step tracking
- **Responsive design**: Mobile-optimized forms

**Backend Integration Points**:
- User authentication (login/signup)
- Initial goal and preference setup
- User onboarding data collection

### `src/pages/NotFound.tsx`
**Purpose**: 404 error page for invalid routes

---

## Custom UI Components

### `src/components/ui/swipe-panels.tsx`
**Purpose**: Mobile-optimized swipeable panel carousel
**Features**:
- Touch/mouse drag support
- Smooth animations and transitions
- Pagination dots for navigation
- Responsive panel switching
- Threshold-based swipe detection

### `src/components/ui/streak-heatmap.tsx`
**Purpose**: GitHub-style activity heatmap visualization
**Features**:
- 365-day activity grid
- Intensity-based color coding (0-4 levels)
- Weekly column layout
- Sample data generation for demo
- Hover tooltips with date/activity info

### `src/components/ui/voice-button.tsx`
**Purpose**: Voice recording interface component
**Features**:
- Large, accessible touch target
- Visual recording state (pulse animation)
- Gradient styling with shadow effects
- Mic/MicOff icon switching

---

## Utility Files

### `src/lib/utils.ts`
**Purpose**: Utility functions for styling
- `cn()` function: Combines clsx and tailwind-merge for conditional classes

### `src/hooks/use-toast.ts`
**Purpose**: Toast notification system
**Features**:
- Global toast state management
- Toast lifecycle management (add, update, dismiss, remove)
- Memory-based state with listeners
- Configurable toast limits and timeouts

### `src/hooks/use-mobile.tsx`
**Purpose**: Mobile device detection hook (responsive design utility)

---

## Shadcn/UI Component Library

The `src/components/ui/` directory contains a comprehensive set of pre-built components from the Shadcn/UI library, built on top of Radix UI primitives. These provide consistent, accessible, and customizable building blocks:

**Form Components**: `input.tsx`, `button.tsx`, `label.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`

**Layout Components**: `card.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `tabs.tsx`, `accordion.tsx`

**Feedback Components**: `toast.tsx`, `toaster.tsx`, `alert.tsx`, `progress.tsx`, `badge.tsx`

**Navigation Components**: `navigation-menu.tsx`, `menubar.tsx`, `breadcrumb.tsx`, `pagination.tsx`

**Overlay Components**: `dialog.tsx`, `drawer.tsx`, `popover.tsx`, `tooltip.tsx`, `hover-card.tsx`, `alert-dialog.tsx`

**Data Display**: `table.tsx`, `chart.tsx`, `calendar.tsx`, `avatar.tsx`, `skeleton.tsx`

**Advanced Components**: `carousel.tsx`, `command.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `form.tsx`

---

## Configuration Files

### `package.json`
**Dependencies Overview**:
- **React ecosystem**: React 18, React Router, React Hook Form
- **UI libraries**: Radix UI components, Lucide React icons
- **Styling**: Tailwind CSS with animations
- **Data fetching**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Utilities**: Date-fns, clsx, class-variance-authority

### `vite.config.ts`
**Build configuration**: Vite with React SWC plugin for fast development

### `tailwind.config.ts`
**Styling configuration**: Custom theme with CSS variables for dark/light modes

### `tsconfig.json`
**TypeScript configuration**: Strict typing with path aliases (@/ for src/)

---

## Backend Integration Requirements

Based on the frontend analysis, the backend will need to support:

### Authentication & User Management
- User registration/login with email/password
- JWT-based session management
- User profile management (name, email, preferences)
- Password reset functionality

### Health Data Models
- **Users**: Profile info, goals, preferences
- **Daily Logs**: Date-based entries for tracking
- **Food Entries**: Meals with nutritional data (calories, protein, etc.)
- **Workouts**: Exercise records with duration, calories, type
- **Habits**: Custom user habits with completion tracking
- **Goals**: User-defined targets (calories, protein, workout frequency)

### API Endpoints Needed
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET/PUT /user/profile` - Profile management
- `GET/PUT /user/goals` - Goals management
- `GET/POST /daily-logs` - Daily activity tracking
- `GET/POST/PUT/DELETE /food-entries` - Food logging
- `GET/POST/PUT/DELETE /workouts` - Workout tracking
- `GET/POST/PUT/DELETE /habits` - Habit management
- `GET /analytics/streak` - Activity heatmap data
- `POST /voice/transcribe` - Voice input processing

### Data Persistence
- User sessions and authentication state
- Historical data for trend analysis
- Real-time progress tracking
- Backup and data export capabilities

### Additional Services
- Voice transcription for quick logging
- Nutritional database integration
- Push notification system
- Data analytics and reporting

---

## Current Limitations & TODOs

1. **Static Data**: Currently uses mock/hardcoded data throughout
2. **Voice Recording**: Placeholder implementation, needs actual speech-to-text
3. **Charts/Analytics**: Trends panel is placeholder, needs chart implementation
4. **Authentication**: Auth flow is simulated, needs real backend integration
5. **Data Persistence**: No actual data storage, all state is temporary
6. **Offline Support**: No PWA features or offline data sync
7. **Push Notifications**: Settings exist but not implemented

---

## Frontend Ports & Interfaces Documentation

### Component Props Interfaces

#### SwipePanels Component (`src/components/ui/swipe-panels.tsx:4-13`)
```typescript
interface SwipePanelsProps {
  panels: {
    id: string;           // Unique identifier for each panel
    title: string;        // Display title for panel
    content: React.ReactNode; // Panel content (JSX)
  }[];
  currentPanel: number;   // Index of currently active panel (0-based)
  onPanelChange: (index: number) => void; // Callback when panel changes
  className?: string;     // Optional CSS classes
}
```

#### StreakHeatmap Component (`src/components/ui/streak-heatmap.tsx:3-6`)
```typescript
interface StreakHeatmapProps {
  data: { date: string; value: number }[]; // Array of date/intensity pairs
  className?: string;    // Optional CSS classes
}
// Note: value should be 0-4 for intensity levels
```

#### VoiceButton Component (`src/components/ui/voice-button.tsx:6-9`)
```typescript
interface VoiceButtonProps {
  onRecord: () => void;  // Callback triggered on button press
  className?: string;    // Optional CSS classes
}
```

### Data Flow Architecture

#### Home Page Data Flow (`src/pages/Home.tsx`)
```
State Management:
├── currentPanel: number (0-4) - Controls which panel is visible
├── quickLogText: string - Text input for manual logging
└── toast: function - Global notification system

Panel Data Sources:
├── TodayPanel - Hardcoded progress data (NEEDS: API integration)
├── FoodPanel - Static meal entries (NEEDS: GET /api/food-entries)
├── WorkoutPanel - Mock workout data (NEEDS: GET /api/workouts)
├── HabitsPanel - Static habit list (NEEDS: GET /api/habits)
└── TrendsPanel - Placeholder (NEEDS: GET /api/analytics)

User Interactions:
├── Panel swiping → onPanelChange(index)
├── Voice recording → handleVoiceRecord() → Toast notification
├── Quick logging → handleQuickLog() → Toast notification
└── Enter key → handleQuickLog()
```

#### Goals Page Data Flow (`src/pages/Goals.tsx`)
```
State Management:
├── calorieGoal: string - Daily calorie target
├── proteinGoal: string - Daily protein target (grams)
├── workoutGoal: string - Weekly workout frequency
├── newHabit: string - Input for adding habits
└── habits: string[] - Array of user habits

User Interactions:
├── Save Goals → handleSaveGoals() → Toast (NEEDS: PUT /api/user/goals)
├── Add Habit → addHabit() → Update habits array (NEEDS: POST /api/habits)
├── Remove Habit → removeHabit(index) → Filter habits (NEEDS: DELETE /api/habits/{id})
└── Enter key → addHabit()
```

#### Profile Page Data Flow (`src/pages/Profile.tsx`)
```
State Management:
├── email: string - User email address
├── name: string - User full name
├── darkMode: boolean - Theme preference
└── notifications: boolean - Push notification setting

User Interactions:
├── Save Profile → handleSaveProfile() → Toast (NEEDS: PUT /api/user/profile)
├── Sign Out → handleSignOut() → Toast (NEEDS: POST /api/auth/logout)
└── Theme Toggle → toggleTheme() → Update darkMode state
```

#### Auth Page Data Flow (`src/pages/Auth.tsx`)
```
State Management:
├── isLogin: boolean - Toggle between login/signup forms
├── isOnboarding: boolean - Controls onboarding flow visibility
├── step: number (1-3) - Current onboarding step
├── email: string - Auth form email
├── password: string - Auth form password
├── calorieGoal: string - Onboarding nutrition goal
├── proteinGoal: string - Onboarding protein goal
├── workoutGoal: string - Onboarding workout goal
├── customHabits: string[] - Onboarding custom habits
└── newHabit: string - Input for adding habits in onboarding

User Interactions:
├── Auth Submit → handleAuth() → Navigate to onboarding (NEEDS: POST /api/auth/login or /register)
├── Onboarding Navigation → setStep() → Progress through steps
├── Complete Setup → completeOnboarding() → Navigate to home (NEEDS: POST /api/user/initial-setup)
└── Add/Remove Habits → addHabit()/removeHabit() → Update customHabits
```

### Critical Integration Points

#### Toast Notification System (`src/hooks/use-toast.ts`)
```typescript
// Global notification interface used across all components
function toast({ title, description, variant?, action? }: ToastProps)

// Usage pattern in components:
const { toast } = useToast();
toast({
  title: "Success message",
  description: "Detailed feedback for user"
});
```

#### Navigation State (`src/components/BottomNav.tsx:6`)
```typescript
// Router state management
const location = useLocation();
// Active state detection: location.pathname === path
```

### API Integration Requirements

#### Expected Response Formats

**User Profile Response:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
  };
}
```

**Goals Response:**
```typescript
interface UserGoals {
  calorieGoal: number;
  proteinGoal: number;
  workoutGoal: number;
}
```

**Habits Response:**
```typescript
interface Habit {
  id: string;
  name: string;
  completed: boolean;
  createdAt: string;
}
```

**Food Entry Response:**
```typescript
interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  timestamp: string;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
```

**Workout Response:**
```typescript
interface Workout {
  id: string;
  name: string;
  duration: number; // minutes
  calories: number;
  type: string;
  completed: boolean;
  timestamp: string;
}
```

**Streak Data Response:**
```typescript
interface StreakData {
  date: string; // YYYY-MM-DD format
  value: number; // 0-4 intensity
}
```

### Error Handling Patterns

#### Component Error Boundaries
- All API calls should handle loading states
- Toast notifications for user feedback
- Graceful fallbacks for missing data

#### Form Validation Requirements
- Email validation in auth forms
- Number validation for goals (positive integers)
- Required field validation
- Character limits for habit names

### State Persistence Requirements

#### Local Storage Needs
- Theme preference (darkMode)
- User session token
- Temporary form data during navigation

#### Backend Synchronization
- Real-time updates not required for MVP
- Optimistic updates with rollback on failure
- Periodic data refresh on app focus

### Mobile-Specific Considerations

#### Touch Interactions
- SwipePanels: Minimum 50px threshold for swipe detection
- VoiceButton: Large touch target (64px minimum)
- Form inputs: Prevent zoom on iOS

#### Performance Optimizations
- Lazy loading for panels not currently visible
- Image optimization for food photos (future feature)
- Debounced search for food database queries

This comprehensive documentation ensures all component interfaces, data flows, and integration points are clearly defined to prevent future bugs and facilitate smooth backend integration.