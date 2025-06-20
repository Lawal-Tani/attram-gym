
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest_time: string;
  order_index: number;
  video_url?: string;
}

interface WorkoutPlan {
  id: string;
  day_of_week: string;
  title: string;
  goal_type: string;
  exercises: Exercise[];
}

export const useWorkoutPlans = () => {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchWorkoutPlans();
  }, [user]);

  const fetchWorkoutPlans = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First check if user has custom workout plans
      const { data: customPlans, error: customError } = await supabase
        .from('workout_plans')
        .select(`
          id,
          day_of_week,
          title,
          goal_type,
          exercises (
            id,
            name,
            sets,
            reps,
            rest_time,
            order_index
          )
        `)
        .eq('user_id', user.id)
        .order('day_of_week');

      if (customError) throw customError;

      if (customPlans && customPlans.length > 0) {
        // Fetch exercise videos and merge with workout plans
        const plansWithVideos = await addVideoUrlsToPlans(customPlans as WorkoutPlan[]);
        setWorkoutPlans(plansWithVideos);
      } else {
        // If no custom plans, create default plans based on user goal
        await createDefaultWorkoutPlans();
      }
    } catch (err) {
      console.error('Error fetching workout plans:', err);
      setError('Failed to load workout plans');
      // Fallback to hardcoded plans if database fails
      setWorkoutPlans(getHardcodedPlans(user.goal));
    } finally {
      setLoading(false);
    }
  };

  const addVideoUrlsToPlans = async (plans: WorkoutPlan[]): Promise<WorkoutPlan[]> => {
    try {
      // Get all exercise videos
      const { data: exerciseVideos, error } = await supabase
        .from('exercise_videos')
        .select('exercise_name, video_url');

      if (error) {
        console.error('Error fetching exercise videos:', error);
        return plans;
      }

      // Create a map for quick lookup
      const videoMap = new Map(
        exerciseVideos?.map(video => [video.exercise_name.toLowerCase(), video.video_url]) || []
      );

      // Add video URLs to exercises
      return plans.map(plan => ({
        ...plan,
        exercises: plan.exercises.map(exercise => ({
          ...exercise,
          video_url: videoMap.get(exercise.name.toLowerCase())
        }))
      }));
    } catch (error) {
      console.error('Error adding video URLs:', error);
      return plans;
    }
  };

  const createDefaultWorkoutPlans = async () => {
    if (!user) return;

    const defaultPlans = getDefaultPlansData(user.goal);

    try {
      // Insert workout plans
      const { data: insertedPlans, error: planError } = await supabase
        .from('workout_plans')
        .insert(defaultPlans.map(plan => ({
          user_id: user.id,
          day_of_week: plan.day_of_week,
          title: plan.title,
          goal_type: user.goal
        })))
        .select();

      if (planError) throw planError;

      // Insert exercises for each plan
      const exercises = [];
      for (let i = 0; i < insertedPlans.length; i++) {
        const plan = insertedPlans[i];
        const planExercises = defaultPlans[i].exercises;
        
        for (let j = 0; j < planExercises.length; j++) {
          exercises.push({
            workout_plan_id: plan.id,
            name: planExercises[j].name,
            sets: planExercises[j].sets,
            reps: planExercises[j].reps,
            rest_time: planExercises[j].rest,
            order_index: j
          });
        }
      }

      const { error: exerciseError } = await supabase
        .from('exercises')
        .insert(exercises);

      if (exerciseError) throw exerciseError;

      // Fetch the complete data with video URLs
      await fetchWorkoutPlans();
    } catch (err) {
      console.error('Error creating default workout plans:', err);
      setWorkoutPlans(getHardcodedPlans(user.goal));
    }
  };

  return { workoutPlans, loading, error, refetch: fetchWorkoutPlans };
};

const getHardcodedPlans = (goal: string): WorkoutPlan[] => {
  // Fallback hardcoded plans - videos will be loaded from database when available
  const weightLossPlan = [
    {
      id: 'temp-1',
      day_of_week: 'Monday',
      title: 'Full Body Circuit',
      goal_type: 'weight_loss',
      exercises: [
        { id: '1', name: 'Jumping Jacks', sets: '3', reps: '30 seconds', rest_time: '30s', order_index: 0 },
        { id: '2', name: 'Push-ups', sets: '3', reps: '10-15', rest_time: '45s', order_index: 1 },
        { id: '3', name: 'Squats', sets: '3', reps: '15-20', rest_time: '45s', order_index: 2 },
        { id: '4', name: 'Mountain Climbers', sets: '3', reps: '30 seconds', rest_time: '30s', order_index: 3 },
        { id: '5', name: 'Plank', sets: '3', reps: '30-60s', rest_time: '60s', order_index: 4 }
      ]
    }
  ];

  const muscleGainPlan = [
    {
      id: 'temp-1',
      day_of_week: 'Monday',
      title: 'Chest & Triceps',
      goal_type: 'muscle_gain',
      exercises: [
        { id: '1', name: 'Bench Press', sets: '4', reps: '8-10', rest_time: '90s', order_index: 0 },
        { id: '2', name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest_time: '60s', order_index: 1 },
        { id: '3', name: 'Dips', sets: '3', reps: '10-15', rest_time: '60s', order_index: 2 },
        { id: '4', name: 'Tricep Extensions', sets: '3', reps: '12-15', rest_time: '45s', order_index: 3 }
      ]
    }
  ];

  return goal === 'weight_loss' ? weightLossPlan : muscleGainPlan;
};

const getDefaultPlansData = (goal: string) => {
  // Default plan data for database insertion
  if (goal === 'weight_loss') {
    return [
      {
        day_of_week: 'Monday',
        title: 'Full Body Circuit',
        exercises: [
          { name: 'Jumping Jacks', sets: '3', reps: '30 seconds', rest: '30s' },
          { name: 'Push-ups', sets: '3', reps: '10-15', rest: '45s' },
          { name: 'Squats', sets: '3', reps: '15-20', rest: '45s' },
          { name: 'Mountain Climbers', sets: '3', reps: '30 seconds', rest: '30s' },
          { name: 'Plank', sets: '3', reps: '30-60s', rest: '60s' }
        ]
      },
      {
        day_of_week: 'Tuesday',
        title: 'Cardio & Core',
        exercises: [
          { name: 'Burpees', sets: '3', reps: '8-12', rest: '60s' },
          { name: 'Russian Twists', sets: '3', reps: '20', rest: '30s' },
          { name: 'High Knees', sets: '3', reps: '30 seconds', rest: '30s' },
          { name: 'Bicycle Crunches', sets: '3', reps: '20', rest: '30s' }
        ]
      }
    ];
  } else {
    return [
      {
        day_of_week: 'Monday',
        title: 'Chest & Triceps',
        exercises: [
          { name: 'Bench Press', sets: '4', reps: '8-10', rest: '90s' },
          { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Dips', sets: '3', reps: '10-15', rest: '60s' },
          { name: 'Tricep Extensions', sets: '3', reps: '12-15', rest: '45s' }
        ]
      },
      {
        day_of_week: 'Tuesday',
        title: 'Back & Biceps',
        exercises: [
          { name: 'Deadlifts', sets: '4', reps: '6-8', rest: '2 min' },
          { name: 'Pull-ups', sets: '3', reps: '8-12', rest: '90s' },
          { name: 'Barbell Rows', sets: '3', reps: '10-12', rest: '60s' },
          { name: 'Barbell Curls', sets: '3', reps: '10-12', rest: '45s' }
        ]
      }
    ];
  }
};
