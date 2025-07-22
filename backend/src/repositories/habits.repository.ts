import { supabaseAdmin } from '@/config/supabase';
import { DatabaseError } from '@/utils/errors/app-errors';
import { Habit, HabitCompletion } from '@/types/models';
import { formatDateToString } from '@/utils/helpers/date';
import logger from '@/utils/logger';

export class HabitsRepository {
  async findAllByUser(userId: string, activeOnly: boolean = true): Promise<Habit[]> {
    try {
      let query = supabaseAdmin
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (activeOnly) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(this.mapToHabit);
    } catch (error) {
      logger.error('HabitsRepository.findAllByUser error:', error);
      throw new DatabaseError('Failed to fetch habits');
    }
  }

  async create(userId: string, name: string): Promise<Habit> {
    try {
      const { data, error } = await supabaseAdmin
        .from('habits')
        .insert({
          user_id: userId,
          name,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToHabit(data);
    } catch (error) {
      logger.error('HabitsRepository.create error:', error);
      throw new DatabaseError('Failed to create habit');
    }
  }

  async createMany(userId: string, habitNames: string[]): Promise<Habit[]> {
    try {
      const insertData = habitNames.map((name) => ({
        user_id: userId,
        name,
        active: true,
      }));

      const { data, error } = await supabaseAdmin
        .from('habits')
        .insert(insertData)
        .select();

      if (error) throw error;

      return data.map(this.mapToHabit);
    } catch (error) {
      logger.error('HabitsRepository.createMany error:', error);
      throw new DatabaseError('Failed to create habits');
    }
  }

  async update(id: string, userId: string, updates: Partial<Habit>): Promise<Habit> {
    try {
      const { data, error } = await supabaseAdmin
        .from('habits')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToHabit(data);
    } catch (error) {
      logger.error('HabitsRepository.update error:', error);
      throw new DatabaseError('Failed to update habit');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      logger.error('HabitsRepository.delete error:', error);
      throw new DatabaseError('Failed to delete habit');
    }
  }

  // Habit Completions
  async getCompletionsByDate(
    userId: string,
    date: Date
  ): Promise<HabitCompletion[]> {
    try {
      const dateString = formatDateToString(date);

      const { data, error } = await supabaseAdmin
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateString);

      if (error) throw error;

      return data.map(this.mapToHabitCompletion);
    } catch (error) {
      logger.error('HabitsRepository.getCompletionsByDate error:', error);
      throw new DatabaseError('Failed to fetch habit completions');
    }
  }

  async toggleCompletion(
    habitId: string,
    userId: string,
    date: Date = new Date()
  ): Promise<HabitCompletion | null> {
    try {
      const dateString = formatDateToString(date);

      // Check if completion exists
      const { data: existing } = await supabaseAdmin
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('date', dateString)
        .single();

      if (existing) {
        // Delete existing completion (uncomplete)
        const { error } = await supabaseAdmin
          .from('habit_completions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return null;
      } else {
        // Create new completion
        const { data, error } = await supabaseAdmin
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: userId,
            date: dateString,
          })
          .select()
          .single();

        if (error) throw error;
        return this.mapToHabitCompletion(data);
      }
    } catch (error) {
      logger.error('HabitsRepository.toggleCompletion error:', error);
      throw new DatabaseError('Failed to toggle habit completion');
    }
  }

  async createCompletions(
    userId: string,
    habitIds: string[],
    date: Date = new Date()
  ): Promise<HabitCompletion[]> {
    try {
      const dateString = formatDateToString(date);

      // First, get existing completions to avoid duplicates
      const { data: existing } = await supabaseAdmin
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', userId)
        .eq('date', dateString)
        .in('habit_id', habitIds);

      const existingHabitIds = new Set((existing || []).map((c) => c.habit_id));
      const newHabitIds = habitIds.filter((id) => !existingHabitIds.has(id));

      if (newHabitIds.length === 0) {
        return [];
      }

      const insertData = newHabitIds.map((habitId) => ({
        habit_id: habitId,
        user_id: userId,
        date: dateString,
      }));

      const { data, error } = await supabaseAdmin
        .from('habit_completions')
        .insert(insertData)
        .select();

      if (error) throw error;

      return data.map(this.mapToHabitCompletion);
    } catch (error) {
      logger.error('HabitsRepository.createCompletions error:', error);
      throw new DatabaseError('Failed to create habit completions');
    }
  }

  private mapToHabit(data: any): Habit {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapToHabitCompletion(data: any): HabitCompletion {
    return {
      id: data.id,
      habitId: data.habit_id,
      userId: data.user_id,
      completedAt: new Date(data.completed_at),
      date: data.date,
    };
  }
}