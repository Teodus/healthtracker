import { useState } from 'react';
import { VoiceRecorder } from '@/components/voice-recorder';
import { SwipePanels } from '@/components/ui/swipe-panels';
import { StreakHeatmap } from '@/components/ui/streak-heatmap';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Target, Utensils, Dumbbell, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { voiceService } from '@/services/voice.service';
import { 
  useDailyStats, 
  useFoodEntries, 
  useWorkouts, 
  useHabits, 
  useHabitCompletions, 
  useUserGoals,
  useToggleHabit,
  useProcessTextInput,
  useStreakData,
  useDeleteFoodEntry,
  useDeleteWorkout,
  useDeleteHabit
} from '@/hooks/use-health-data';

export default function Home() {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [quickLogText, setQuickLogText] = useState('');
  const { toast } = useToast();
  
  // Debug: Check current user
  const currentUser = localStorage.getItem('current_user');
  console.log('[DEBUG] Current user:', currentUser ? JSON.parse(currentUser) : 'No user');

  const handleVoiceTranscription = async (transcription: string, extractedData: any) => {
    try {
      // Auto-create the entries based on the transcription
      const response = await voiceService.quickLog(transcription, true);
      
      if (response.createdEntries.length > 0) {
        const entryTypes = response.createdEntries.map(e => e.type).join(', ');
        toast({
          title: "Entries created",
          description: `Added ${response.createdEntries.length} ${entryTypes} entries from your voice note`,
        });
        
        // Data will refresh automatically via React Query
      } else {
        toast({
          title: "Transcribed",
          description: `"${transcription}" - but couldn't identify specific entries to create`,
          variant: "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error processing voice note",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const processTextMutation = useProcessTextInput();

  const handleQuickLog = async () => {
    if (quickLogText.trim()) {
      try {
        await processTextMutation.mutateAsync(quickLogText);
        setQuickLogText('');
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const TodayPanel = () => {
    const { data: stats, isLoading: statsLoading } = useDailyStats();
    const { data: goals } = useUserGoals();
    const { data: workouts = [] } = useWorkouts();
    
    if (statsLoading) {
      return (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      );
    }

    const calorieProgress = goals?.calorieGoal ? (stats?.totalCalories || 0) / goals.calorieGoal * 100 : 0;
    const proteinProgress = goals?.proteinGoal ? (stats?.totalProtein || 0) / goals.proteinGoal * 100 : 0;
    const workoutCount = workouts.length;
    const workoutTarget = goals?.workoutGoal ? Math.ceil(goals.workoutGoal / 7) : 1;

    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Calories</span>
              <span className="text-muted-foreground">
                {stats?.totalCalories || 0} / {goals?.calorieGoal || 2000}
              </span>
            </div>
            <Progress value={Math.min(calorieProgress, 100)} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Protein</span>
              <span className="text-muted-foreground">
                {stats?.totalProtein || 0}g / {goals?.proteinGoal || 150}g
              </span>
            </div>
            <Progress value={Math.min(proteinProgress, 100)} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Workouts</span>
            <Badge variant={workoutCount >= workoutTarget ? "default" : "secondary"}>
              {workoutCount} / {workoutTarget} completed
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Habits</span>
            <Badge variant={stats?.completedHabits === stats?.totalHabits ? "default" : "secondary"}>
              {stats?.completedHabits || 0} / {stats?.totalHabits || 0} completed
            </Badge>
          </div>

          {stats?.caloriesBurned > 0 && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Calories Burned</span>
                <span className="text-green-500 font-medium">-{stats.caloriesBurned}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Net Calories</span>
                <span className="font-medium">{stats.netCalories}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const FoodPanel = () => {
    const { data: foodEntries = [], isLoading, refetch } = useFoodEntries();
    const deleteFoodEntry = useDeleteFoodEntry();

    console.log('[DEBUG] FoodPanel - foodEntries:', foodEntries, 'isLoading:', isLoading);

    const groupedByMeal = foodEntries.reduce((acc, entry) => {
      console.log('[DEBUG] Processing entry:', entry);
      if (!acc[entry.meal]) acc[entry.meal] = [];
      acc[entry.meal].push(entry);
      return acc;
    }, {} as Record<string, typeof foodEntries>);

    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Utensils className="w-5 h-5 mr-2 text-primary" />
            Food Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : foodEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No food logged yet today</p>
              <p className="text-xs mt-1">Use voice or text to log your meals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                const meals = groupedByMeal[mealType];
                if (!meals || meals.length === 0) return null;
                
                return (
                  <div key={mealType}>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">
                      {mealType}
                    </h4>
                    <div className="space-y-2">
                      {meals.map((entry) => (
                        <div key={entry.id} className="p-3 bg-muted/20 rounded-lg group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{entry.name}</p>
                              {entry.description && (
                                <p className="text-xs text-muted-foreground mt-1">{entry.description}</p>
                              )}
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="text-right">
                                <p className="text-sm font-medium">{entry.calories} cal</p>
                                <p className="text-xs text-muted-foreground">{entry.protein}g protein</p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteFoodEntry.mutate(entry.id)}
                                disabled={deleteFoodEntry.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const WorkoutPanel = () => {
    const { data: workouts = [], isLoading } = useWorkouts();
    const deleteWorkout = useDeleteWorkout();

    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Dumbbell className="w-5 h-5 mr-2 text-primary" />
            Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No workouts logged yet today</p>
              <p className="text-xs mt-1">Tell me about your exercise</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <div key={workout.id} className="p-3 bg-muted/20 rounded-lg group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-medium">{workout.name}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workout.type} • {workout.duration} min • {workout.calories} calories
                      </p>
                      {workout.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{workout.notes}</p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteWorkout.mutate(workout.id)}
                      disabled={deleteWorkout.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const HabitsPanel = () => {
    const { data: habits = [], isLoading: habitsLoading } = useHabits();
    const { data: completions = [], isLoading: completionsLoading } = useHabitCompletions();
    const toggleHabit = useToggleHabit();
    const deleteHabit = useDeleteHabit();

    const isLoading = habitsLoading || completionsLoading;
    const completedHabitIds = completions.map(c => c.habitId);

    const handleToggle = async (habitId: string) => {
      try {
        await toggleHabit.mutateAsync(habitId);
      } catch (error) {
        // Error handled by mutation
      }
    };

    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <CheckCircle className="w-5 h-5 mr-2 text-primary" />
            Daily Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No habits created yet</p>
              <p className="text-xs mt-1">Add habits in your goals settings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = completedHabitIds.includes(habit.id);
                return (
                  <div key={habit.id} className="flex items-center space-x-3 group">
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className="flex items-center space-x-3 flex-1 text-left hover:bg-muted/20 p-2 rounded-lg transition-colors"
                      disabled={toggleHabit.isPending}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-success border-success' 
                          : 'border-muted-foreground/30'
                      }`}>
                        {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                          {habit.name}
                        </span>
                      </div>
                    </button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteHabit.mutate(habit.id)}
                      disabled={deleteHabit.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const TrendsPanel = () => (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" />
          Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Charts and analytics coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Wrapper component for StreakHeatmap to handle data loading
  const StreakHeatmapWrapper = () => {
    const { data: streakData, isLoading } = useStreakData();
    
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    // Convert streak dates to the format expected by StreakHeatmap
    const heatmapData = streakData?.streakDates?.map(date => ({
      date,
      value: 1
    })) || [];

    return <StreakHeatmap data={heatmapData} />;
  };

  const panels = [
    { id: 'today', title: 'Today', content: <TodayPanel /> },
    { id: 'food', title: 'Food', content: <FoodPanel /> },
    { id: 'workouts', title: 'Workouts', content: <WorkoutPanel /> },
    { id: 'habits', title: 'Habits', content: <HabitsPanel /> },
    { id: 'trends', title: 'Trends', content: <TrendsPanel /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TracKtical
          </h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Streak Heatmap - Right below logo */}
        <Card className="bg-card/50 border-border/50">
          <StreakHeatmapWrapper />
        </Card>

        {/* Swipe Panels - Carousel of metrics */}
        <SwipePanels
          panels={panels}
          currentPanel={currentPanel}
          onPanelChange={setCurrentPanel}
          className="min-h-[250px]"
        />

        {/* Voice + Quick Log Section - At bottom for easy thumb access */}
        <div className="text-center space-y-6">
          <VoiceRecorder 
            onTranscription={handleVoiceTranscription}
            context="general"
            className="mx-auto"
          />
          
          <div className="flex space-x-2">
            <Input
              placeholder="Quick log something..."
              value={quickLogText}
              onChange={(e) => setQuickLogText(e.target.value)}
              className="bg-input/50 border-border/50"
              onKeyPress={(e) => e.key === 'Enter' && handleQuickLog()}
              disabled={processTextMutation.isPending}
            />
            {processTextMutation.isPending && (
              <div className="flex items-center px-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Add bottom padding to account for bottom navigation */}
        <div className="pb-20" />
      </div>
    </div>
  );
}