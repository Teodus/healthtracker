import { supabaseAdmin } from '@/config/supabase';
import { DatabaseError } from '@/utils/errors/app-errors';
import { FoodEntry } from '@/types/models';
import { getStartOfDay, getEndOfDay } from '@/utils/helpers/date';
import logger from '@/utils/logger';

export class FoodRepository {
  async findByUserAndDate(userId: string, date: Date): Promise<FoodEntry[]> {
    try {
      const startOfDay = getStartOfDay(date);
      const endOfDay = getEndOfDay(date);

      const { data, error } = await supabaseAdmin
        .from('food_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startOfDay.toISOString())
        .lte('timestamp', endOfDay.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return data.map(this.mapToFoodEntry);
    } catch (error) {
      logger.error('FoodRepository.findByUserAndDate error:', error);
      throw new DatabaseError('Failed to fetch food entries');
    }
  }

  async create(entry: Omit<FoodEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodEntry> {
    try {
      const { data, error } = await supabaseAdmin
        .from('food_entries')
        .insert({
          user_id: entry.userId,
          name: entry.name,
          calories: entry.calories,
          protein: entry.protein,
          meal: entry.meal,
          description: entry.description || null,
          analysis_confidence: entry.analysisConfidence || null,
          nutrition_breakdown: entry.nutritionBreakdown || null,
          timestamp: entry.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapToFoodEntry(data);
    } catch (error) {
      logger.error('FoodRepository.create error:', error);
      throw new DatabaseError('Failed to create food entry');
    }
  }

  async createMany(
    userId: string,
    entries: Array<Omit<FoodEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<FoodEntry[]> {
    try {
      const insertData = entries.map((entry) => ({
        user_id: userId,
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        meal: entry.meal,
        description: entry.description || null,
        analysis_confidence: entry.analysisConfidence || null,
        nutrition_breakdown: entry.nutritionBreakdown || null,
        timestamp: entry.timestamp.toISOString(),
      }));

      const { data, error } = await supabaseAdmin
        .from('food_entries')
        .insert(insertData)
        .select();

      if (error) throw error;

      return data.map(this.mapToFoodEntry);
    } catch (error) {
      logger.error('FoodRepository.createMany error:', error);
      throw new DatabaseError('Failed to create food entries');
    }
  }

  async update(
    id: string,
    userId: string,
    updates: Partial<FoodEntry>
  ): Promise<FoodEntry> {
    try {
      const { data, error } = await supabaseAdmin
        .from('food_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapToFoodEntry(data);
    } catch (error) {
      logger.error('FoodRepository.update error:', error);
      throw new DatabaseError('Failed to update food entry');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('food_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      logger.error('FoodRepository.delete error:', error);
      throw new DatabaseError('Failed to delete food entry');
    }
  }

  private mapToFoodEntry(data: any): FoodEntry {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      calories: data.calories,
      protein: data.protein,
      meal: data.meal,
      description: data.description,
      analysisConfidence: data.analysis_confidence,
      nutritionBreakdown: data.nutrition_breakdown,
      timestamp: new Date(data.timestamp),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}