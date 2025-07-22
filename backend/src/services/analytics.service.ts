import { FoodRepository } from '@/repositories/food.repository';
import { WorkoutRepository } from '@/repositories/workout.repository';
import { HabitsRepository } from '@/repositories/habits.repository';
import { UserRepository } from '@/repositories/user.repository';
import { getPastDates, formatDateToString } from '@/utils/helpers/date';

interface DailySummary {
  date: string;
  nutrition: {
    caloriesConsumed: number;
    calorieGoal: number;
    proteinConsumed: number;
    proteinGoal: number;
    mealsLogged: number;
  };
  workouts: {
    completed: number;
    weeklyGoal: number;
    weeklyCompleted: number;
    caloriesBurned: number;
  };
  habits: {
    completed: number;
    total: number;
    completedHabits: string[];
    pendingHabits: string[];
  };
}

interface StreakData {
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
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export class AnalyticsService {
  private foodRepo: FoodRepository;
  private workoutRepo: WorkoutRepository;
  private habitsRepo: HabitsRepository;
  private userRepo: UserRepository;

  constructor() {
    this.foodRepo = new FoodRepository();
    this.workoutRepo = new WorkoutRepository();
    this.habitsRepo = new HabitsRepository();
    this.userRepo = new UserRepository();
  }

  async getDailySummary(userId: string, date?: string): Promise<DailySummary> {
    const targetDate = date ? new Date(date) : new Date();
    
    // Get user goals
    const goals = await this.userRepo.getGoals(userId);
    const defaultGoals = {
      calorieGoal: 2000,
      proteinGoal: 150,
      workoutGoal: 5,
    };
    const userGoals = goals || defaultGoals;

    // Get food entries
    const foodEntries = await this.foodRepo.findByUserAndDate(userId, targetDate);
    const nutrition = {
      caloriesConsumed: foodEntries.reduce((sum, e) => sum + e.calories, 0),
      calorieGoal: userGoals.calorieGoal,
      proteinConsumed: foodEntries.reduce((sum, e) => sum + e.protein, 0),
      proteinGoal: userGoals.proteinGoal,
      mealsLogged: foodEntries.length,
    };

    // Get workouts
    const dayWorkouts = await this.workoutRepo.findByUserAndDate(userId, targetDate);
    
    // Get week's workouts for weekly progress
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const weekWorkouts = await this.workoutRepo.findByUserAndDateRange(
      userId,
      startOfWeek,
      endOfWeek
    );

    const workouts = {
      completed: dayWorkouts.length,
      weeklyGoal: userGoals.workoutGoal,
      weeklyCompleted: weekWorkouts.length,
      caloriesBurned: dayWorkouts.reduce((sum, w) => sum + w.calories, 0),
    };

    // Get habits
    const userHabits = await this.habitsRepo.findAllByUser(userId);
    const completions = await this.habitsRepo.getCompletionsByDate(userId, targetDate);
    const completedHabitIds = new Set(completions.map(c => c.habitId));

    const habits = {
      completed: completions.length,
      total: userHabits.length,
      completedHabits: userHabits
        .filter(h => completedHabitIds.has(h.id))
        .map(h => h.name),
      pendingHabits: userHabits
        .filter(h => !completedHabitIds.has(h.id))
        .map(h => h.name),
    };

    return {
      date: formatDateToString(targetDate),
      nutrition,
      workouts,
      habits,
    };
  }

  async getStreakData(userId: string, days: number = 365): Promise<StreakData> {
    const dates = getPastDates(days);
    const streakData = [];
    
    // Get all data for the period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      
      // Get activities for this date
      const [foodEntries, workouts, habits, completions] = await Promise.all([
        this.foodRepo.findByUserAndDate(userId, date),
        this.workoutRepo.findByUserAndDate(userId, date),
        this.habitsRepo.findAllByUser(userId),
        this.habitsRepo.getCompletionsByDate(userId, date),
      ]);

      // Calculate activity value (0-4)
      let value = 0;
      const activities = {
        foodLogged: foodEntries.length > 0,
        workoutCompleted: workouts.length > 0,
        habitsCompleted: completions.length,
        totalHabits: habits.length,
      };

      if (activities.foodLogged) value++;
      if (activities.workoutCompleted) value++;
      if (activities.totalHabits > 0) {
        const habitCompletionRate = activities.habitsCompleted / activities.totalHabits;
        if (habitCompletionRate >= 0.8) value += 2;
        else if (habitCompletionRate >= 0.5) value++;
      }

      streakData.push({
        date: dateStr,
        value,
        activities,
      });
    }

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalActiveDays = 0;

    // Start from most recent date
    for (let i = streakData.length - 1; i >= 0; i--) {
      if (streakData[i].value > 0) {
        tempStreak++;
        totalActiveDays++;
        
        // Update current streak if still ongoing
        if (i === streakData.length - 1 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
        if (i === streakData.length - 1) {
          currentStreak = 0;
        }
      }
    }

    return {
      streakData,
      currentStreak,
      longestStreak,
      totalActiveDays,
    };
  }
}