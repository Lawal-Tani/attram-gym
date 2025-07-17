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
import { Target, Dumbbell, Flame, Star, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const WorkoutPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { workoutPlans, loading, error, refetch } = useWorkoutPlans();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(user?.fitness_level || 'beginner');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'bodyweight' | 'equipment'>('all');

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

  // Filter workouts based on equipment selection
  const getFilteredWorkouts = () => {
    if (equipmentFilter === 'bodyweight') {
      return sortedWorkoutPlans.filter(w =>
        w.exercises.every((ex: any) => (ex.equipment || 'bodyweight').toLowerCase() === 'bodyweight')
      );
    } else if (equipmentFilter === 'equipment') {
      return sortedWorkoutPlans.filter(w =>
        w.exercises.some((ex: any) => (ex.equipment || 'bodyweight').toLowerCase() !== 'bodyweight')
      );
    }
    return sortedWorkoutPlans; // Show all workouts
  };

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Your Workout Plan
            </h1>
            <p className="text-lg text-muted-foreground">
              Today is <span className="font-semibold text-accent">{currentDay}</span>
            </p>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-card rounded-2xl p-6 border shadow-sm">
            {/* Difficulty Selection */}
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <button
                    key={level}
                    onClick={() => handleLevelChange(level as 'beginner' | 'intermediate' | 'advanced')}
                    className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2
                      ${selectedLevel === level
                        ? 'bg-accent text-accent-foreground shadow-md'
                        : 'bg-muted text-muted-foreground hover:bg-accent/20 hover:text-accent-foreground'}
                    `}
                  >
                    {level === 'beginner' && <Dumbbell className="w-4 h-4" />}
                    {level === 'intermediate' && <Flame className="w-4 h-4" />}
                    {level === 'advanced' && <Star className="w-4 h-4" />}
                    <span className="capitalize">{level}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Filter */}
            <div className="flex-1 lg:max-w-xs">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Equipment
              </label>
              <Select value={equipmentFilter} onValueChange={(value: 'all' | 'bodyweight' | 'equipment') => setEquipmentFilter(value)}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      {equipmentFilter === 'all' ? 'All Workouts' :
                       equipmentFilter === 'bodyweight' ? 'No Equipment' : 'Equipment Required'}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workouts</SelectItem>
                  <SelectItem value="bodyweight">No Equipment</SelectItem>
                  <SelectItem value="equipment">Equipment Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Info */}
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                <Target className="h-3 w-3 mr-1" />
                {selectedLevel} level
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {user?.goal === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Workouts Section */}
        <div className="space-y-8">
          {filteredWorkouts.length > 0 ? (
            <div className="grid gap-6">
              {filteredWorkouts.map((workout) => {
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
          ) : (
            <div className="text-center py-16">
              <div className="bg-muted/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No workouts found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your equipment filter or difficulty level to see more workout options.
              </p>
            </div>
          )}
        </div>

        {/* Tips Section */}
        {filteredWorkouts.length > 0 && (
          <div className="mt-16">
            <WorkoutTips />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPlan;
