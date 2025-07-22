// Application model types

export interface User {
  id: string;
  email: string;
  name: string | null;
  preferences: {
    darkMode?: boolean;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGoals {
  id: string;
  userId: string;
  calorieGoal: number;
  proteinGoal: number;
  workoutGoal: number;
  updatedAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedAt: Date;
  date: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  analysisConfidence?: number;
  nutritionBreakdown?: Record<string, { calories: number; protein: number }>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration: number; // minutes
  calories: number;
  completed: boolean;
  notes?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailySummary {
  id: string;
  userId: string;
  date: string;
  totalCalories: number;
  totalProtein: number;
  mealsLogged: number;
  workoutsCompleted: number;
  habitsCompleted: number;
  totalHabits: number;
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  preferences: {
    darkMode?: boolean;
    notifications?: boolean;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}