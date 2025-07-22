import { supabaseAdmin } from '@/config/supabase';
import { DatabaseError } from '@/utils/errors/app-errors';
import { Workout } from '@/types/models';
import { getStartOfDay, getEndOfDay } from '@/utils/helpers/date';
import logger from '@/utils/logger';

export class WorkoutRepository {
  async findByUserAndDate(userId: string, date: Date): Promise<Workout[]> {
    try {
      const startOfDay = getStartOfDay(date);
      const endOfDay = getEndOfDay(date);

      const { data, error } = await supabaseAdmin
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfDay.toISOString())
        .lte('timestamp', endOfDay.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map(this.mapToWorkout);
    } catch (error) {
      logger.error('WorkoutRepository.findByUserAndDate error:', error);
      throw new DatabaseError('Failed to fetch workouts');
    }
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Workout[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map(this.mapToWorkout);
    } catch (error) {
      logger.error('WorkoutRepository.findByUserAndDateRange error:', error);
      throw new DatabaseError('Failed to fetch workouts');
    }
  }

  async create(
    workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Workout> {
    try {
      const { data, error } = await supabaseAdmin
        .from('workouts')
        .insert({
          user_id: workout.userId,
          name: workout.name,
          type: workout.type,
          duration: workout.duration,
          calories: workout.calories,
          completed: workout.completed,
          notes: workout.notes || null,
          timestamp: workout.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToWorkout(data);
    } catch (error) {
      logger.error('WorkoutRepository.create error:', error);
      throw new DatabaseError('Failed to create workout');
    }
  }

  async createMany(
    userId: string,
    workouts: Array<Omit<Workout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Workout[]> {
    try {
      const insertData = workouts.map((workout) => ({
        user_id: userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories,
        completed: workout.completed,
        notes: workout.notes || null,
        timestamp: workout.timestamp.toISOString(),
      }));

      const { data, error } = await supabaseAdmin
        .from('workouts')
        .insert(insertData)
        .select();

      if (error) throw error;

      return data.map(this.mapToWorkout);
    } catch (error) {
      logger.error('WorkoutRepository.createMany error:', error);
      throw new DatabaseError('Failed to create workouts');
    }
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<Workout>
  ): Promise<Workout> {
    try {
      const { data, error } = await supabaseAdmin
        .from('workouts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToWorkout(data);
    } catch (error) {
      logger.error('WorkoutRepository.update error:', error);
      throw new DatabaseError('Failed to update workout');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('workouts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      logger.error('WorkoutRepository.delete error:', error);
      throw new DatabaseError('Failed to delete workout');
    }
  }

  private mapToWorkout(data: any): Workout {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.type,
      duration: data.duration,
      calories: data.calories,
      completed: data.completed,
      notes: data.notes,
      timestamp: new Date(data.timestamp),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}