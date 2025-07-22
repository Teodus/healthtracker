import { UserRepository } from '@/repositories/user.repository';
import { HabitsRepository } from '@/repositories/habits.repository';
import { NotFoundError } from '@/utils/errors/app-errors';
import { User, UserGoals } from '@/types/models';
import { 
  UpdateProfileDto, 
  UpdateGoalsDto, 
  InitialSetupDto 
} from '@/validators/user.validators';
import logger from '@/utils/logger';

export class UserService {
  private userRepo: UserRepository;
  private habitsRepo: HabitsRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.habitsRepo = new HabitsRepository();
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async updateProfile(userId: string, updates: UpdateProfileDto): Promise<User> {
    // Ensure user exists
    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError('User');
    }

    return this.userRepo.updateProfile(userId, updates);
  }

  async getGoals(userId: string): Promise<UserGoals | null> {
    return this.userRepo.getGoals(userId);
  }

  async updateGoals(userId: string, goals: UpdateGoalsDto): Promise<UserGoals> {
    return this.userRepo.upsertGoals(userId, goals);
  }

  async completeInitialSetup(userId: string, data: InitialSetupDto): Promise<{
    message: string;
    goalsId: string;
    habitIds: string[];
  }> {
    try {
      // Update user goals
      const goals = await this.userRepo.upsertGoals(userId, data.goals);

      // Create habits
      const habits = await this.habitsRepo.createMany(userId, data.habits);
      const habitIds = habits.map(h => h.id);

      logger.info(`Initial setup completed for user ${userId}`);

      return {
        message: 'Initial setup completed',
        goalsId: goals.id,
        habitIds,
      };
    } catch (error) {
      logger.error('Initial setup failed:', error);
      throw new Error('Failed to complete initial setup');
    }
  }
}