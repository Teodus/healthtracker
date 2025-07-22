import { WorkoutRepository } from '@/repositories/workout.repository';
import { Workout } from '@/types/models';
import { CreateWorkoutDto, UpdateWorkoutDto } from '@/validators/workout.validators';
import { NotFoundError } from '@/utils/errors/app-errors';
import { WORKOUT_CALORIES } from '@/config/constants';
import logger from '@/utils/logger';

export class WorkoutService {
  private workoutRepo: WorkoutRepository;

  constructor() {
    this.workoutRepo = new WorkoutRepository();
  }

  async getWorkouts(userId: string, date?: string, week?: boolean): Promise<{
    workouts: Workout[];
    weeklyStats?: {
      totalWorkouts: number;
      totalDuration: number;
      totalCalories: number;
      goalProgress: number;
    };
  }> {
    const targetDate = date ? new Date(date) : new Date();
    
    if (week) {
      // Get week's workouts
      const startOfWeek = new Date(targetDate);
      startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const workouts = await this.workoutRepo.findByUserAndDateRange(
        userId,
        startOfWeek,
        endOfWeek
      );

      const stats = {
        totalWorkouts: workouts.length,
        totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
        totalCalories: workouts.reduce((sum, w) => sum + w.calories, 0),
        goalProgress: 0, // Will be calculated with user goals
      };

      return { workouts, weeklyStats: stats };
    } else {
      // Get single day's workouts
      const workouts = await this.workoutRepo.findByUserAndDate(userId, targetDate);
      return { workouts };
    }
  }

  async createWorkout(userId: string, data: CreateWorkoutDto): Promise<Workout> {
    // Calculate calories if not provided
    const calories = data.calories || this.calculateCalories(data.type, data.duration);

    const workout = await this.workoutRepo.create({
      userId,
      name: data.name,
      type: data.type,
      duration: data.duration,
      calories,
      completed: true,
      notes: data.notes,
      timestamp: new Date(),
    });

    logger.info(`Created workout for user ${userId}: ${workout.name}`);
    return workout;
  }

  async createManyFromParsedData(
    userId: string,
    parsedWorkouts: Array<{
      name: string;
      type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
      duration: number;
      calories: number;
      notes?: string;
    }>
  ): Promise<Workout[]> {
    const workouts = parsedWorkouts.map(workout => ({
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
      calories: workout.calories,
      completed: true,
      notes: workout.notes,
      timestamp: new Date(),
    }));

    return this.workoutRepo.createMany(userId, workouts);
  }

  async updateWorkout(
    id: string,
    userId: string,
    updates: UpdateWorkoutDto
  ): Promise<Workout> {
    // Verify the workout exists and belongs to the user
    const workouts = await this.workoutRepo.findByUserAndDate(userId, new Date());
    const workout = workouts.find(w => w.id === id);
    
    if (!workout) {
      throw new NotFoundError('Workout');
    }

    // Recalculate calories if duration or type changed
    if (updates.duration || updates.type) {
      const type = updates.type || workout.type;
      const duration = updates.duration || workout.duration;
      updates.calories = updates.calories || this.calculateCalories(type, duration);
    }

    return this.workoutRepo.update(id, userId, updates);
  }

  async deleteWorkout(id: string, userId: string): Promise<void> {
    await this.workoutRepo.delete(id, userId);
    logger.info(`Deleted workout ${id} for user ${userId}`);
  }

  private calculateCalories(type: string, duration: number): number {
    const caloriesPerMinute = 
      WORKOUT_CALORIES[type as keyof typeof WORKOUT_CALORIES] || 
      WORKOUT_CALORIES.default;
    
    return Math.round(duration * caloriesPerMinute);
  }
}