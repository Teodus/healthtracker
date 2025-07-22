import { apiClient } from '@/lib/api-client';

// Types based on backend models
export interface FoodEntry {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
  description?: string;
  nutritionInfo?: any;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  duration: number; // minutes
  calories: number;
  type: string;
  timestamp: string;
  notes?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedAt: string;
}

export interface UserGoals {
  id: string;
  userId: string;
  calorieGoal: number;
  proteinGoal: number;
  workoutGoal: number;
  updatedAt: string;
}

export interface DailyStats {
  totalCalories: number;
  totalProtein: number;
  calories: number;
  netCalories: number;
  completedHabits: number;
  totalHabits: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  streakData: Array<{
    date: string;
    value: number;
    activities: {
      foodLogged: boolean;
      workoutCompleted: boolean;
      habitsCompleted: number;
      totalHabits: number;
    };
  }>;
}

class HealthService {
  // Food Entries
  async getFoodEntries(date?: string): Promise<FoodEntry[]> {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get<{ entries: FoodEntry[] }>(`/food-entries${params}`);
    return response.entries || [];
  }

  async createFoodEntry(data: Partial<FoodEntry>): Promise<FoodEntry> {
    const response = await apiClient.post<{ entry: FoodEntry }>('/food-entries', data);
    return response.entry;
  }

  async deleteFoodEntry(id: string): Promise<void> {
    await apiClient.delete(`/food-entries/${id}`);
  }

  // Workouts
  async getWorkouts(date?: string): Promise<Workout[]> {
    const params = date ? `?date=${date}` : '';
    const response = await apiClient.get<{ workouts: Workout[] }>(`/workouts${params}`);
    return response.workouts || [];
  }

  async createWorkout(data: Partial<Workout>): Promise<Workout> {
    const response = await apiClient.post<{ workout: Workout }>('/workouts', data);
    return response.workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    await apiClient.delete(`/workouts/${id}`);
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    const response = await apiClient.get<{ habits: Habit[] }>('/habits');
    return response.habits || [];
  }

  async createHabit(data: { name: string }): Promise<Habit> {
    const response = await apiClient.post<{ habit: Habit }>('/habits', data);
    return response.habit;
  }

  async deleteHabit(id: string): Promise<void> {
    await apiClient.delete(`/habits/${id}`);
  }

  async getTodayHabitCompletions(): Promise<HabitCompletion[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<{ completions: HabitCompletion[] }>(`/habits/completions?date=${today}`);
    return response.completions || [];
  }

  async toggleHabitCompletion(habitId: string): Promise<{ completed: boolean }> {
    const response = await apiClient.post<{ completed: boolean }>(`/habits/${habitId}/toggle`);
    return response;
  }

  // Goals
  async getUserGoals(): Promise<UserGoals> {
    try {
      const response = await apiClient.get<{ goals: UserGoals }>('/user/goals');
      return response.goals || {
        id: '',
        userId: '',
        calorieGoal: 2000,
        proteinGoal: 150,
        workoutGoal: 3,
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      // Return default goals if none exist
      return {
        id: '',
        userId: '',
        calorieGoal: 2000,
        proteinGoal: 150,
        workoutGoal: 3,
        updatedAt: new Date().toISOString()
      };
    }
  }

  async updateUserGoals(goals: Partial<UserGoals>): Promise<UserGoals> {
    const response = await apiClient.put<{ goals: UserGoals }>('/user/goals', goals);
    return response.goals;
  }

  // Analytics
  async getStreakData(): Promise<StreakData> {
    try {
      const response = await apiClient.get<StreakData>('/analytics/streak');
      return response || {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        streakData: []
      };
    } catch (error) {
      // Return empty streak data if none exists
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        streakData: []
      };
    }
  }

  async getDailyStats(date?: string): Promise<DailyStats> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Fetch all data for the day
    const [foodEntries, workouts, habits, completions, goals] = await Promise.all([
      this.getFoodEntries(targetDate),
      this.getWorkouts(targetDate),
      this.getHabits(),
      this.getTodayHabitCompletions(),
      this.getUserGoals()
    ]);

    // Calculate totals
    const totalCalories = foodEntries.reduce((sum, entry) => sum + entry.calories, 0);
    const totalProtein = foodEntries.reduce((sum, entry) => sum + entry.protein, 0);
    const caloriesBurned = workouts.reduce((sum, workout) => sum + workout.calories, 0);
    
    return {
      totalCalories,
      totalProtein,
      caloriesBurned,
      netCalories: totalCalories - caloriesBurned,
      completedHabits: completions.length,
      totalHabits: habits.length
    };
  }

  // Process text input through AI
  async processTextInput(text: string): Promise<any> {
    const response = await voiceService.quickLog(text, true);
    return response;
  }
}

// Import voice service for text processing
import { voiceService } from './voice.service';

// Export singleton instance
export const healthService = new HealthService();