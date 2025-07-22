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
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.foodEntries });
      
      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(QUERY_KEYS.foodEntries);
      
      // Optimistically update by removing the deleted item
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.foodEntries },
        (old: FoodEntry[] | undefined) => {
          if (!old) return [];
          return old.filter(entry => entry.id !== deletedId);
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousEntries };
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEntries) {
        queryClient.setQueryData(QUERY_KEYS.foodEntries, context.previousEntries);
      }
      toast({
        title: "Error",
        description: "Failed to delete food entry",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.foodEntries });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyStats });
    },
    onSuccess: () => {
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
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.workouts });
      
      // Snapshot the previous value
      const previousWorkouts = queryClient.getQueryData(QUERY_KEYS.workouts);
      
      // Optimistically update by removing the deleted item
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.workouts },
        (old: Workout[] | undefined) => {
          if (!old) return [];
          return old.filter(workout => workout.id !== deletedId);
        }
      );
      
      // Return a context object with the snapshotted value
      return { previousWorkouts };
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousWorkouts) {
        queryClient.setQueryData(QUERY_KEYS.workouts, context.previousWorkouts);
      }
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workouts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyStats });
    },
    onSuccess: () => {
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
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.habits });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.habitCompletions });
      
      // Snapshot the previous values
      const previousHabits = queryClient.getQueryData(QUERY_KEYS.habits);
      const previousCompletions = queryClient.getQueryData(QUERY_KEYS.habitCompletions);
      
      // Optimistically update habits by removing the deleted item
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.habits },
        (old: Habit[] | undefined) => {
          if (!old) return [];
          return old.filter(habit => habit.id !== deletedId);
        }
      );
      
      // Also remove any completions for this habit
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.habitCompletions },
        (old: any[] | undefined) => {
          if (!old) return [];
          return old.filter(completion => completion.habitId !== deletedId);
        }
      );
      
      // Return a context object with the snapshotted values
      return { previousHabits, previousCompletions };
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousHabits) {
        queryClient.setQueryData(QUERY_KEYS.habits, context.previousHabits);
      }
      if (context?.previousCompletions) {
        queryClient.setQueryData(QUERY_KEYS.habitCompletions, context.previousCompletions);
      }
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habitCompletions });
    },
    onSuccess: () => {
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