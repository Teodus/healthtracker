import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Target, Utensils, Dumbbell, Plus, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth.context';
import { loginSchema, signupSchema } from '@/services/auth.service';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Auth form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Onboarding state
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [workoutGoal, setWorkoutGoal] = useState('');
  const [customHabits, setCustomHabits] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAuth = async () => {
    setErrors({});
    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Validate login data
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        await login({ email, password });
        // Navigation handled by auth context
      } else {
        // Validate signup data
        const result = signupSchema.safeParse({ name, email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        await signup({ name, email, password });
        // Navigation handled by auth context
      }
    } catch (error) {
      // Error handling done in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      setCustomHabits([...customHabits, newHabit.trim()]);
      setNewHabit('');
    }
  };

  const removeHabit = (index: number) => {
    setCustomHabits(customHabits.filter((_, i) => i !== index));
  };

  const completeOnboarding = () => {
    toast({
      title: "Setup complete!",
      description: "Welcome to HealthTrack. Your journey starts now.",
    });
    // TODO: Save onboarding data to backend
    navigate('/');
  };

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
        <div className="container max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
              HealthTrack
            </h1>
            <p className="text-muted-foreground">Let's personalize your experience</p>
            
            {/* Progress indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= step ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-center">
                {step === 1 && "Nutrition Goals"}
                {step === 2 && "Workout Goals"}
                {step === 3 && "Daily Habits"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="calories">Daily Calorie Goal</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="e.g., 2200"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="protein">Daily Protein Goal (grams)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="e.g., 180"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(e.target.value)}
                      className="bg-input/50 border-border/50"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="workouts">Workouts per Week</Label>
                  <Input
                    id="workouts"
                    type="number"
                    placeholder="e.g., 5"
                    value={workoutGoal}
                    onChange={(e) => setWorkoutGoal(e.target.value)}
                    className="bg-input/50 border-border/50"
                  />
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label>Add Custom Habits</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="e.g., Drink 8 glasses of water"
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        className="bg-input/50 border-border/50"
                        onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                      />
                      <Button onClick={addHabit} size="icon" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {customHabits.length > 0 && (
                    <div className="space-y-2">
                      <Label>Your Habits</Label>
                      {customHabits.map((habit, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <span className="text-sm">{habit}</span>
                          <Button
                            onClick={() => removeHabit(index)}
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex space-x-2">
                {step > 1 && (
                  <Button
                    onClick={() => setStep(step - 1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={step === 3 ? completeOnboarding : () => setStep(step + 1)}
                  className="flex-1"
                >
                  {step === 3 ? 'Complete Setup' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            HealthTrack
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? 'Welcome back to your health journey' : 'Start your wellness journey today'}
          </p>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`pl-10 bg-input/50 border-border/50 ${errors.name ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 bg-input/50 border-border/50 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 bg-input/50 border-border/50 ${errors.password ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button 
              onClick={handleAuth} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <div className="text-center">
              <Button
                onClick={() => setIsLogin(!isLogin)}
                variant="link"
                className="text-muted-foreground hover:text-primary"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}