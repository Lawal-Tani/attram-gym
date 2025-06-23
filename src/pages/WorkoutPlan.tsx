import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/NavigationBar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import WorkoutCard from '@/components/workout/WorkoutCard';
import WorkoutTips from '@/components/workout/WorkoutTips';
import LoadingSpinner from '@/components/workout/LoadingSpinner';
import ErrorDisplay from '@/components/workout/ErrorDisplay';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Target } from 'lucide-react';

const WorkoutPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('all');

  useEffect(() => {
    if (user) {
      fetchWorkouts();
      loadTodayCompletions();
    }
  }, [user, difficulty]);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('workout_plans')
        .select('*')
        .eq('goal_type', user?.goal);

      if (difficulty !== 'all') {
        query = query.eq('fitness_level', difficulty);
      }

      const { data, error } = await query.order('day_of_week');

      if (error) throw error;

      setWorkoutPlans(data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

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
        setCompletedWorkouts(data.map(c => c.workout_plan_id));
      }
    } catch (err) {
      console.error('Error loading completions:', err);
    }
  };

  const markWorkoutComplete = async (workoutPlanId: string, dayTitle: string) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('workout_completions').insert({
        user_id: user.id,
        workout_plan_id: workoutPlanId,
        completed_date: today,
        duration_minutes: 45,
      });

      if (!error) {
        setCompletedWorkouts(prev => [...prev, workoutPlanId]);
        toast({
          title: 'Workout Completed! 🎉',
          description: `Great job completing your ${dayTitle} workout!`,
        });
      }
    } catch (err) {
      console.error('Error marking workout complete:', err);
      toast({
        title: 'Error',
        description: 'Failed to mark workout as complete',
        variant: 'destructive',
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

  const currentDay = getCurrentDay();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <NavigationBar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Workout Plan</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <span>Today is {currentDay}</span>

            <Badge
              variant="outline"
              className={`capitalize ${getFitnessLevelColor(user?.fitness_level || 'beginner')}`}
            >
              <Target className="h-3 w-3 mr-1" />
              {user?.fitness_level || 'beginner'} level
            </Badge>

            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
              {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
            </Badge>

            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6">
          {workoutPlans.map(workout => {
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
