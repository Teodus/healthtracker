import { apiClient } from '@/lib/api-client';

interface InitialSetupData {
  goals: {
    calorieGoal: number;
    proteinGoal: number;
    workoutGoal: number;
  };
  habits: string[];
}

class UserService {
  async completeInitialSetup(data: InitialSetupData): Promise<void> {
    await apiClient.post('/user/initial-setup', data);
    
    // Update the local user data to mark onboarding as completed
    const currentUser = localStorage.getItem('current_user');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      user.onboardingCompleted = true;
      localStorage.setItem('current_user', JSON.stringify(user));
    }
  }

  async updateGoals(goals: Partial<InitialSetupData['goals']>): Promise<void> {
    await apiClient.put('/user/goals', goals);
  }

  async getGoals(): Promise<InitialSetupData['goals']> {
    const response = await apiClient.get<{ goals: InitialSetupData['goals'] }>('/user/goals');
    return response.goals;
  }
}

export const userService = new UserService();