import { HabitsRepository } from '@/repositories/habits.repository';
import { Habit, HabitCompletion } from '@/types/models';
import { CreateHabitDto, UpdateHabitDto } from '@/validators/habit.validators';
import { NotFoundError } from '@/utils/errors/app-errors';
import logger from '@/utils/logger';

export class HabitsService {
  private habitsRepo: HabitsRepository;

  constructor() {
    this.habitsRepo = new HabitsRepository();
  }

  async getHabitsWithCompletions(userId: string, date?: string): Promise<{
    habits: Array<{
      id: string;
      name: string;
      completed: boolean;
      completedAt: string | null;
      createdAt: string;
    }>;
    date: string;
  }> {
    const targetDate = date ? new Date(date) : new Date();
    
    // Get all active habits
    const habits = await this.habitsRepo.findAllByUser(userId, true);
    
    // Get completions for the date
    const completions = await this.habitsRepo.getCompletionsByDate(userId, targetDate);
    const completionMap = new Map(
      completions.map(c => [c.habitId, c])
    );

    // Combine habits with their completion status
    const habitsWithStatus = habits.map(habit => ({
      id: habit.id,
      name: habit.name,
      completed: completionMap.has(habit.id),
      completedAt: completionMap.get(habit.id)?.completedAt.toISOString() || null,
      createdAt: habit.createdAt.toISOString(),
    }));

    return {
      habits: habitsWithStatus,
      date: targetDate.toISOString().split('T')[0],
    };
  }

  async createHabit(userId: string, data: CreateHabitDto): Promise<Habit> {
    const habit = await this.habitsRepo.create(userId, data.name);
    logger.info(`Created habit for user ${userId}: ${habit.name}`);
    return habit;
  }

  async updateHabit(
    id: string,
    userId: string,
    updates: UpdateHabitDto
  ): Promise<Habit> {
    // Verify the habit exists and belongs to the user
    const habits = await this.habitsRepo.findAllByUser(userId, false);
    const habit = habits.find(h => h.id === id);
    
    if (!habit) {
      throw new NotFoundError('Habit');
    }

    return this.habitsRepo.update(id, userId, updates);
  }

  async deleteHabit(id: string, userId: string): Promise<void> {
    await this.habitsRepo.delete(id, userId);
    logger.info(`Deleted habit ${id} for user ${userId}`);
  }

  async toggleHabitCompletion(
    habitId: string,
    userId: string
  ): Promise<HabitCompletion | null> {
    // Verify the habit exists and belongs to the user
    const habits = await this.habitsRepo.findAllByUser(userId);
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) {
      throw new NotFoundError('Habit');
    }

    const completion = await this.habitsRepo.toggleCompletion(habitId, userId);
    
    logger.info(
      `Toggled habit ${habitId} for user ${userId}: ${
        completion ? 'completed' : 'uncompleted'
      }`
    );
    
    return completion;
  }

  async completeHabitsFromParsedData(
    userId: string,
    parsedHabits: Array<{ name: string; completed: boolean }>
  ): Promise<number> {
    // Get user's habits
    const userHabits = await this.habitsRepo.findAllByUser(userId);
    
    // Match parsed habits with user's habits
    const completedHabitIds: string[] = [];
    
    for (const parsedHabit of parsedHabits) {
      if (!parsedHabit.completed) continue;
      
      // Find matching habit (case-insensitive)
      const userHabit = userHabits.find(
        h => h.name.toLowerCase().includes(parsedHabit.name.toLowerCase()) ||
             parsedHabit.name.toLowerCase().includes(h.name.toLowerCase())
      );
      
      if (userHabit) {
        completedHabitIds.push(userHabit.id);
      }
    }

    // Mark habits as completed
    if (completedHabitIds.length > 0) {
      await this.habitsRepo.createCompletions(userId, completedHabitIds);
    }

    return completedHabitIds.length;
  }
}