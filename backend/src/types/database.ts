// Database schema types generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
          preferences: {
            darkMode?: boolean;
            notifications?: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name?: string | null;
          preferences?: {
            darkMode?: boolean;
            notifications?: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string | null;
          preferences?: {
            darkMode?: boolean;
            notifications?: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      user_goals: {
        Row: {
          id: string;
          user_id: string;
          calorie_goal: number;
          protein_goal: number;
          workout_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          calorie_goal?: number;
          protein_goal?: number;
          workout_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          calorie_goal?: number;
          protein_goal?: number;
          workout_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          date: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at?: string;
          date?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          date?: string;
        };
      };
      food_entries: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          calories: number;
          protein: number;
          meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          description: string | null;
          analysis_confidence: number | null;
          nutrition_breakdown: Record<string, { calories: number; protein: number }> | null;
          timestamp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          calories: number;
          protein?: number;
          meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          description?: string | null;
          analysis_confidence?: number | null;
          nutrition_breakdown?: Record<string, { calories: number; protein: number }> | null;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          calories?: number;
          protein?: number;
          meal?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          description?: string | null;
          analysis_confidence?: number | null;
          nutrition_breakdown?: Record<string, { calories: number; protein: number }> | null;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
          duration: number;
          calories: number;
          completed: boolean;
          notes: string | null;
          timestamp: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
          duration: number;
          calories?: number;
          completed?: boolean;
          notes?: string | null;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
          duration?: number;
          calories?: number;
          completed?: boolean;
          notes?: string | null;
          timestamp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_summaries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_calories: number;
          total_protein: number;
          meals_logged: number;
          workouts_completed: number;
          habits_completed: number;
          total_habits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_calories?: number;
          total_protein?: number;
          meals_logged?: number;
          workouts_completed?: number;
          habits_completed?: number;
          total_habits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_calories?: number;
          total_protein?: number;
          meals_logged?: number;
          workouts_completed?: number;
          habits_completed?: number;
          total_habits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}