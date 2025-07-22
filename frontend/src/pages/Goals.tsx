import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Target, Utensils, Dumbbell, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/user.service';
import { useAuth } from '@/contexts/auth.context';

export default function Goals() {
  const [calorieGoal, setCalorieGoal] = useState('2200');
  const [proteinGoal, setProteinGoal] = useState('180');
  const [workoutGoal, setWorkoutGoal] = useState('5');
  const [newHabit, setNewHabit] = useState('');
  const [habits, setHabits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSaveGoals = async () => {
    try {
      setIsLoading(true);
      
      console.log('[DEBUG] Saving goals:', {
        calorieGoal: parseInt(calorieGoal),
        proteinGoal: parseInt(proteinGoal),
        workoutGoal: parseInt(workoutGoal),
        habits: habits,
        user: user,
        onboardingCompleted: user?.onboardingCompleted
      });
      
      // If this is the first time (onboarding), call initial setup
      if (user && !user.onboardingCompleted) {
        await userService.completeInitialSetup({
          goals: {
            calorieGoal: parseInt(calorieGoal),
            proteinGoal: parseInt(proteinGoal),
            workoutGoal: parseInt(workoutGoal)
          },
          habits: habits
        });
        
        toast({
          title: "Setup complete!",
          description: "Welcome to HealthTrack. Your journey starts now.",
        });
        
        // Force reload to update auth context with new user data
        window.location.href = '/';
      } else {
        // Regular goals update
        await userService.updateGoals({
          calorieGoal: parseInt(calorieGoal),
          proteinGoal: parseInt(proteinGoal),
          workoutGoal: parseInt(workoutGoal)
        });
        
        toast({
          title: "Goals updated",
          description: "Your nutrition and workout goals have been saved.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save goals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([...habits, newHabit.trim()]);
      setNewHabit('');
      toast({
        title: "Habit added",
        description: `Added "${newHabit.trim()}" to your daily habits.`,
      });
    }
  };

  const removeHabit = (index: number) => {
    const habitName = habits[index];
    setHabits(habits.filter((_, i) => i !== index));
    toast({
      title: "Habit removed",
      description: `Removed "${habitName}" from your habits.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-center">Goals & Habits</h1>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Nutrition Goals */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Utensils className="w-5 h-5 mr-2 text-primary" />
              Nutrition Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Daily Calories</Label>
              <Input
                id="calories"
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (grams)</Label>
              <Input
                id="protein"
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Workout Goals */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Dumbbell className="w-5 h-5 mr-2 text-primary" />
              Workout Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workouts">Workouts per week</Label>
              <Input
                id="workouts"
                type="number"
                value={workoutGoal}
                onChange={(e) => setWorkoutGoal(e.target.value)}
                className="bg-input/50 border-border/50"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSaveGoals} 
          className="w-full"
          disabled={isLoading}
        >
          <Target className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : (user && !user.onboardingCompleted ? 'Complete Setup' : 'Save Goals')}
        </Button>

        <Separator className="my-6" />

        {/* Daily Habits */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Daily Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Add a new habit..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                className="bg-input/50 border-border/50"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              <Button onClick={addHabit} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {habits.map((habit, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="text-sm">{habit}</span>
                  <Button
                    onClick={() => removeHabit(index)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}