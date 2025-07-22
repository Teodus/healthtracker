import { supabaseAdmin } from '@/config/supabase';
import { DatabaseError } from '@/utils/errors/app-errors';
import { User, UserGoals } from '@/types/models';
import logger from '@/utils/logger';

export class UserRepository {
  async findById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? this.mapToUser(data) : null;
    } catch (error) {
      logger.error('UserRepository.findById error:', error);
      throw new DatabaseError('Failed to fetch user');
    }
  }

  async updateProfile(
    userId: string,
    updates: { name?: string; email?: string; preferences?: any }
  ): Promise<User> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToUser(data);
    } catch (error) {
      logger.error('UserRepository.updateProfile error:', error);
      throw new DatabaseError('Failed to update user profile');
    }
  }

  async getGoals(userId: string): Promise<UserGoals | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data ? this.mapToUserGoals(data) : null;
    } catch (error) {
      logger.error('UserRepository.getGoals error:', error);
      throw new DatabaseError('Failed to fetch user goals');
    }
  }

  async upsertGoals(
    userId: string,
    goals: { calorieGoal: number; proteinGoal: number; workoutGoal: number }
  ): Promise<UserGoals> {
    try {
      const { data, error } = await supabaseAdmin
        .from('user_goals')
        .upsert({
          user_id: userId,
          calorie_goal: goals.calorieGoal,
          protein_goal: goals.proteinGoal,
          workout_goal: goals.workoutGoal,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToUserGoals(data);
    } catch (error) {
      logger.error('UserRepository.upsertGoals error:', error);
      throw new DatabaseError('Failed to update user goals');
    }
  }

  private mapToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      preferences: data.preferences || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToUserGoals(data: any): UserGoals {
    return {
      id: data.id,
      userId: data.user_id,
      calorieGoal: data.calorie_goal,
      proteinGoal: data.protein_goal,
      workoutGoal: data.workout_goal,
      updatedAt: new Date(data.updated_at),
    };
  }
}