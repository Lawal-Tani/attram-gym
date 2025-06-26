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
import { Target, Dumbbell, Flame, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WorkoutPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { workoutPlans, loading, error, refetch } = useWorkoutPlans();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(user?.fitness_level || 'beginner');

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
      // Find the workout object
      const workout = workoutPlans.find(w => w.id === workoutPlanId);
      // Insert into workout_completions as before
      const { error } = await supabase
        .from('workout_completions')
        .insert({
          user_id: user.id,
          workout_plan_id: workoutPlanId,
          completed_date: today,
          duration_minutes: 45 // Default duration
        });
      // Insert into progress_entries for each exercise (strength chart)
      if (workout && workout.exercises && Array.isArray(workout.exercises)) {
        const strengthEntries = workout.exercises.map((exercise: any) => ({
          user_id: user.id,
          exercise_name: exercise.name,
          weight: 45, // Default weight
          date: today,
          workout_type: 'strength',
        }));
        if (strengthEntries.length > 0) {
          await supabase.from('progress_entries').insert(strengthEntries);
        }
      }
      // Insert into progress_entries for workout distribution chart (one entry for the workout type)
      if (workout && workout.goal_type) {
        await supabase.from('progress_entries').insert([
          {
            user_id: user.id,
            exercise_name: workout.title, // Or use workout.goal_type if preferred
            weight: null, // Not needed for distribution
            date: today,
            workout_type: workout.goal_type,
          },
        ]);
      }
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

  const onViewWorkout = (workoutPlanId: string) => {
    const workout = workoutPlans.find(w => w.id === workoutPlanId);
    if (workout) {
      alert(`Viewing workout: ${workout.title}`);
      // You can replace this with a modal or navigation later
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  const currentDay = getCurrentDay();

  const sortedWorkoutPlans = [...workoutPlans].sort((a, b) => {
    return dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
  });

  // Categorize workouts
  const bodyweightWorkouts = sortedWorkoutPlans.filter(w =>
    w.exercises.every((ex: any) => (ex.equipment || 'bodyweight').toLowerCase() === 'bodyweight')
  );
  const equipmentWorkouts = sortedWorkoutPlans.filter(w =>
    w.exercises.some((ex: any) => (ex.equipment || 'bodyweight').toLowerCase() !== 'bodyweight')
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <NavigationBar />
      
      <div className="container mx-auto px-2 sm:px-2 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Workout Plan
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="font-semibold text-muted-foreground">Difficulty:</span>
            <div className="flex flex-wrap gap-2">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level as 'beginner' | 'intermediate' | 'advanced')}
                  className={`px-4 py-2 rounded-full flex items-center gap-1 font-semibold border transition-all
                    ${selectedLevel === level
                      ? 'bg-accent text-white border-accent shadow-lg'
                      : 'bg-muted text-muted-foreground border-muted hover:bg-accent/20'}
                  `}
                >
                  {level === 'beginner' && <Dumbbell className="w-4 h-4 mr-1" />}
                  {level === 'intermediate' && <Flame className="w-4 h-4 mr-1" />}
                  {level === 'advanced' && <Star className="w-4 h-4 mr-1" />}
                  <span className="capitalize">{level}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span>Today is {currentDay}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge 
                variant="outline" 
                className={`capitalize bg-accent/20 text-accent border-accent`}
              >
                <Target className="h-3 w-3 mr-1" />
                {selectedLevel} level
              </Badge>
              <Badge variant="outline" className="text-accent border-accent bg-accent/20">
                {user?.goal === 'weight_loss' ? 'weight loss' : 'muscle gain'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Bodyweight Workouts Section */}
          {bodyweightWorkouts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-emerald-400">Bodyweight Workouts</h2>
              <div className="grid gap-6">
                {bodyweightWorkouts.map((workout) => {
                  const isToday = workout.day_of_week === currentDay;
                  const isCompleted = isWorkoutCompleted(workout.id);
                  return (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      isToday={isToday}
                      isCompleted={isCompleted}
                      onComplete={markWorkoutComplete}
                      onView={onViewWorkout}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {/* Equipment Workouts Section */}
          {equipmentWorkouts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-400">Equipment Workouts</h2>
              <div className="grid gap-6">
                {equipmentWorkouts.map((workout) => {
                  const isToday = workout.day_of_week === currentDay;
                  const isCompleted = isWorkoutCompleted(workout.id);
                  return (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      isToday={isToday}
                      isCompleted={isCompleted}
                      onComplete={markWorkoutComplete}
                      onView={onViewWorkout}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <WorkoutTips />
      </div>
    </div>
  );
};

export default WorkoutPlan;
