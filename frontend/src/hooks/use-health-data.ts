import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthService, DailyStats, FoodEntry, Workout, Habit, UserGoals } from '@/services/health.service';
import { toast } from '@/hooks/use-toast';

// Query keys
const QUERY_KEYS = {
  dailyStats: ['dailyStats'],
  foodEntries: ['foodEntries'],
  workouts: ['workouts'],
  habits: ['habits'],
  habitCompletions: ['habitCompletions'],
  userGoals: ['userGoals'],
  streak: ['streak']
};

// Daily stats hook
export function useDailyStats(date?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dailyStats, date],
    queryFn: () => healthService.getDailyStats(date),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Food entries hooks
export function useFoodEntries(date?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.foodEntries, date],
    queryFn: async () => {
      console.log('[DEBUG] Fetching food entries for date:', date || 'today');
      try {
        const entries = await healthService.getFoodEntries(date);
        console.log('[DEBUG] Food entries received:', entries);
        return entries;
      } catch (error) {
        console.error('[DEBUG] Error fetching food entries:', error);
        throw error;
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useCreateFoodEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<FoodEntry>) => healthService.createFoodEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.foodEntries });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyStats });
    },
  });
}

export function useDeleteFoodEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => healthService.deleteFoodEntry(id),
    onSuccess: () => {
      // Immediately refetch for smooth UI update
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.foodEntries });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.dailyStats });
      toast({
        title: "Food entry deleted",
        description: "The food entry has been removed",
      });
    },
  });
}

// Workout hooks
export function useWorkouts(date?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.workouts, date],
    queryFn: async () => {
      console.log('[DEBUG] Fetching workouts for date:', date || 'today');
      try {
        const workouts = await healthService.getWorkouts(date);
        console.log('[DEBUG] Workouts received:', workouts);
        return workouts;
      } catch (error) {
        console.error('[DEBUG] Error fetching workouts:', error);
        throw error;
      }
    },
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Workout>) => {
      console.log('[DEBUG] Creating workout with data:', data);
      try {
        const workout = await healthService.createWorkout(data);
        console.log('[DEBUG] Workout created successfully:', workout);
        return workout;
      } catch (error) {
        console.error('[DEBUG] Error creating workout:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[DEBUG] Invalidating workout queries after successful creation');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workouts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyStats });
    },
    onError: (error) => {
      console.error('[DEBUG] Workout creation failed:', error);
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => healthService.deleteWorkout(id),
    onSuccess: () => {
      // Immediately refetch for smooth UI update
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.workouts });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.dailyStats });
      toast({
        title: "Workout deleted",
        description: "The workout has been removed",
      });
    },
  });
}

// Habits hooks
export function useHabits() {
  return useQuery({
    queryKey: QUERY_KEYS.habits,
    queryFn: async () => {
      console.log('[DEBUG] Fetching habits');
      try {
        const habits = await healthService.getHabits();
        console.log('[DEBUG] Habits received:', habits);
        // Check for duplicates
        const ids = habits.map(h => h.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.warn('[DEBUG] Duplicate habit IDs detected!');
        }
        return habits;
      } catch (error) {
        console.error('[DEBUG] Error fetching habits:', error);
        throw error;
      }
    },
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useHabitCompletions() {
  return useQuery({
    queryKey: QUERY_KEYS.habitCompletions,
    queryFn: () => healthService.getTodayHabitCompletions(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useToggleHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (habitId: string) => healthService.toggleHabitCompletion(habitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habitCompletions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyStats });
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => healthService.createHabit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits });
      toast({
        title: "Habit created",
        description: "Your new habit has been added",
      });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => healthService.deleteHabit(id),
    onSuccess: () => {
      // Immediately refetch for smooth UI update
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.habits });
      queryClient.refetchQueries({ queryKey: QUERY_KEYS.habitCompletions });
      toast({
        title: "Habit deleted",
        description: "The habit has been removed",
      });
    },
  });
}

// User goals hooks
export function useUserGoals() {
  return useQuery({
    queryKey: QUERY_KEYS.userGoals,
    queryFn: () => healthService.getUserGoals(),
  });
}

export function useUpdateGoals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goals: Partial<UserGoals>) => healthService.updateUserGoals(goals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userGoals });
      toast({
        title: "Goals updated",
        description: "Your health goals have been saved",
      });
    },
  });
}

// Streak data hook
export function useStreakData() {
  return useQuery({
    queryKey: QUERY_KEYS.streak,
    queryFn: () => healthService.getStreakData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Process text input hook
export function useProcessTextInput() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (text: string) => {
      console.log('[DEBUG] Processing text input:', text);
      const response = await healthService.processTextInput(text);
      console.log('[DEBUG] Process text response:', response);
      return response;
    },
    onSuccess: (response) => {
      console.log('[DEBUG] Text processing successful, invalidating queries');
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.foodEntries });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workouts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habitCompletions });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyStats });
      
      if (response.createdEntries && response.createdEntries.length > 0) {
        const types = response.createdEntries.map((e: any) => e.type).join(', ');
        toast({
          title: "Entries created",
          description: `Added ${response.createdEntries.length} ${types} entries`,
        });
      }
    },
    onError: (error: any) => {
      console.error('[DEBUG] Text processing error:', error);
      toast({
        title: "Processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}