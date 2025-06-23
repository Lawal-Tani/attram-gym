import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { supabase } from '@/integrations/supabase/client';
import WorkoutCard from '@/components/workout/WorkoutCard';
import WorkoutTips from '@/components/workout/WorkoutTips';
import LoadingSpinner from '@/components/workout/LoadingSpinner';
import ErrorDisplay from '@/components/workout/ErrorDisplay';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WorkoutPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { workoutPlans, loading, error, refetch } = useWorkoutPlans();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(user?.fitness_level || 'beginner');

  React.useEffect(() => {
    if (user) {
      loadTodayCompletions();
    }
  }, [user]);

  const loadTodayCompletions = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('workout_completions')
        .select('workout_plan_id')
        .eq('user_id', user.id)
        .eq('completed_date', today);

      if (!error && data) {
        setCompletedWorkouts(data.map(completion => completion.workout_plan_id));
      }
    } catch (err) {
      console.error('Error loading completions:', err);
    }
  };

  const markWorkoutComplete = async (workoutPlanId: string, dayTitle: string) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('workout_completions')
        .insert({
          user_id: user.id,
          workout_plan_id: workoutPlanId,
          completed_date: today,
          duration_minutes: 45 // Default duration
        });

      if (!error) {
        setCompletedWorkouts(prev => [...prev, workoutPlanId]);
        
        toast({
          title: "Workout Completed! 🎉",
          description: `Great job completing your ${dayTitle} workout!`,
        });
      }
    } catch (err) {
      console.error('Error marking workout complete:', err);
      toast({
        title: "Error",
        description: "Failed to mark workout as complete",
        variant: "destructive",
      });
    }
  };

  const isWorkoutCompleted = (workoutPlanId: string) => {
    return completedWorkouts.includes(workoutPlanId);
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getFitnessLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLevelChange = async (level: 'beginner' | 'intermediate' | 'advanced') => {
    setSelectedLevel(level);
    if (!user) return;
    // Update user fitness level in DB
    await supabase
      .from('users')
      .update({ fitness_level: level })
      .eq('id', user.id);
    // Optionally update user context if needed
    // Refetch workout plans
    if (typeof refetch === 'function') refetch();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const currentDay = getCurrentDay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Workout Plan
          </h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-semibold text-gray-700">Difficulty:</span>
            <Select value={selectedLevel} onValueChange={handleLevelChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 text-gray-600">
            <span>Today is {currentDay}</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`capitalize ${getFitnessLevelColor(selectedLevel)}`}
              >
                <Target className="h-3 w-3 mr-1" />
                {selectedLevel} level
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                {user?.goal === 'weight_loss' ? 'weight loss' : 'muscle gain'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {workoutPlans.map((workout) => {
            const isToday = workout.day_of_week === currentDay;
            const isCompleted = isWorkoutCompleted(workout.id);
            
            return (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isToday={isToday}
                isCompleted={isCompleted}
                onComplete={markWorkoutComplete}
              />
            );
          })}
        </div>

        <WorkoutTips />
      </div>
    </div>
  );
};

export default WorkoutPlan;
