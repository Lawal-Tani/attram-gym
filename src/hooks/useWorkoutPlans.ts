
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
  fitness_level: string;
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

      // First check if user has custom workout plans for their fitness level
      const { data: customPlans, error: customError } = await supabase
        .from('workout_plans')
        .select(`
          id,
          day_of_week,
          title,
          goal_type,
          fitness_level,
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
        .eq('fitness_level', user.fitness_level)
        .order('day_of_week');

      if (customError) throw customError;

      if (customPlans && customPlans.length > 0) {
        // Fetch exercise videos and merge with workout plans
        const plansWithVideos = await addVideoUrlsToPlans(customPlans as WorkoutPlan[]);
        setWorkoutPlans(plansWithVideos);
      } else {
        // If no custom plans, create default plans based on user goal and fitness level
        await createDefaultWorkoutPlans();
      }
    } catch (err) {
      console.error('Error fetching workout plans:', err);
      setError('Failed to load workout plans');
      // Fallback to hardcoded plans if database fails
      setWorkoutPlans(getHardcodedPlans(user.goal, user.fitness_level));
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

    const defaultPlans = getDefaultPlansData(user.goal, user.fitness_level);

    try {
      // Insert workout plans
      const { data: insertedPlans, error: planError } = await supabase
        .from('workout_plans')
        .insert(defaultPlans.map(plan => ({
          user_id: user.id,
          day_of_week: plan.day_of_week,
          title: plan.title,
          goal_type: user.goal,
          fitness_level: user.fitness_level
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
      setWorkoutPlans(getHardcodedPlans(user.goal, user.fitness_level));
    }
  };

  return { workoutPlans, loading, error, refetch: fetchWorkoutPlans };
};

const getHardcodedPlans = (goal: string, fitnessLevel: string): WorkoutPlan[] => {
  if (goal === 'weight_loss') {
    if (fitnessLevel === 'beginner') {
      return [
        {
          id: 'temp-1',
          day_of_week: 'Monday',
          title: 'Beginner Full Body',
          goal_type: 'weight_loss',
          fitness_level: 'beginner',
          exercises: [
            { id: '1', name: 'Modified Push-ups', sets: '2', reps: '8-12', rest_time: '60s', order_index: 0 },
            { id: '2', name: 'Wall Sits', sets: '2', reps: '20-30s', rest_time: '60s', order_index: 1 },
            { id: '3', name: 'Assisted Squats', sets: '2', reps: '10-15', rest_time: '60s', order_index: 2 },
            { id: '4', name: 'Plank', sets: '2', reps: '15-30s', rest_time: '60s', order_index: 3 }
          ]
        }
      ];
    } else if (fitnessLevel === 'intermediate') {
      return [
        {
          id: 'temp-1',
          day_of_week: 'Monday',
          title: 'Intermediate Circuit',
          goal_type: 'weight_loss',
          fitness_level: 'intermediate',
          exercises: [
            { id: '1', name: 'Push-ups', sets: '3', reps: '12-18', rest_time: '45s', order_index: 0 },
            { id: '2', name: 'Jump Squats', sets: '3', reps: '15-20', rest_time: '45s', order_index: 1 },
            { id: '3', name: 'Mountain Climbers', sets: '3', reps: '30s', rest_time: '30s', order_index: 2 },
            { id: '4', name: 'Bulgarian Split Squats', sets: '3', reps: '10 each leg', rest_time: '45s', order_index: 3 }
          ]
        }
      ];
    } else {
      return [
        {
          id: 'temp-1',
          day_of_week: 'Monday',
          title: 'Advanced HIIT',
          goal_type: 'weight_loss',
          fitness_level: 'advanced',
          exercises: [
            { id: '1', name: 'Advanced Push-ups', sets: '4', reps: '15-25', rest_time: '30s', order_index: 0 },
            { id: '2', name: 'Pistol Squats', sets: '4', reps: '5-8 each leg', rest_time: '45s', order_index: 1 },
            { id: '3', name: 'Burpees', sets: '4', reps: '12-20', rest_time: '30s', order_index: 2 },
            { id: '4', name: 'Handstand Push-ups', sets: '3', reps: '5-10', rest_time: '60s', order_index: 3 }
          ]
        }
      ];
    }
  } else {
    // Muscle gain plans by fitness level
    if (fitnessLevel === 'beginner') {
      return [
        {
          id: 'temp-1',
          day_of_week: 'Monday',
          title: 'Beginner Upper Body',
          goal_type: 'muscle_gain',
          fitness_level: 'beginner',
          exercises: [
            { id: '1', name: 'Modified Push-ups', sets: '3', reps: '8-12', rest_time: '90s', order_index: 0 },
            { id: '2', name: 'Pike Push-ups', sets: '2', reps: '5-8', rest_time: '90s', order_index: 1 },
            { id: '3', name: 'Wall Sits', sets: '3', reps: '30-45s', rest_time: '60s', order_index: 2 }
          ]
        }
      ];
    } else if (fitnessLevel === 'intermediate') {
      return [
        {
          id: 'temp-1',
          day_of_week: 'Monday',
          title: 'Intermediate Strength',
          goal_type: 'muscle_gain',
          fitness_level: 'intermediate',
          exercises: [
            { id: '1', name: 'Push-ups', sets: '4', reps: '12-15', rest_time: '90s', order_index: 0 },
            { id: '2', name: 'Diamond Push-ups', sets: '3', reps: '8-12', rest_time: '90s', order_index: 1 },
            { id: '3', name: 'Bulgarian Split Squats', sets: '3', reps: '10-12 each', rest_time: '90s', order_index: 2 },
            { id: '4', name: 'Pike Push-ups', sets: '3', reps: '8-12', rest_time: '90s', order_index: 3 }
          ]
        }
      ];
    } else {
      return [
        {
          id: 'temp-1',
          day_of_week: 'Monday',
          title: 'Advanced Strength',
          goal_type: 'muscle_gain',
          fitness_level: 'advanced',
          exercises: [
            { id: '1', name: 'Handstand Push-ups', sets: '4', reps: '8-12', rest_time: '2 min', order_index: 0 },
            { id: '2', name: 'Pistol Squats', sets: '4', reps: '8-10 each', rest_time: '2 min', order_index: 1 },
            { id: '3', name: 'Advanced Push-ups', sets: '4', reps: '15-20', rest_time: '90s', order_index: 2 },
            { id: '4', name: 'Muscle-ups', sets: '3', reps: '3-8', rest_time: '3 min', order_index: 3 }
          ]
        }
      ];
    }
  }
};

const getDefaultPlansData = (goal: string, fitnessLevel: string) => {
  if (goal === 'weight_loss') {
    if (fitnessLevel === 'beginner') {
      return [
        {
          day_of_week: 'Monday',
          title: 'Beginner Full Body',
          exercises: [
            { name: 'Modified Push-ups', sets: '2', reps: '8-12', rest: '60s' },
            { name: 'Wall Sits', sets: '2', reps: '20-30s', rest: '60s' },
            { name: 'Assisted Squats', sets: '2', reps: '10-15', rest: '60s' },
            { name: 'Plank', sets: '2', reps: '15-30s', rest: '60s' }
          ]
        },
        {
          day_of_week: 'Wednesday',
          title: 'Beginner Cardio',
          exercises: [
            { name: 'Jumping Jacks', sets: '2', reps: '20s', rest: '40s' },
            { name: 'High Knees', sets: '2', reps: '20s', rest: '40s' },
            { name: 'Mountain Climbers', sets: '2', reps: '15s', rest: '45s' }
          ]
        }
      ];
    } else if (fitnessLevel === 'intermediate') {
      return [
        {
          day_of_week: 'Monday',
          title: 'Intermediate Circuit',
          exercises: [
            { name: 'Push-ups', sets: '3', reps: '12-18', rest: '45s' },
            { name: 'Jump Squats', sets: '3', reps: '15-20', rest: '45s' },
            { name: 'Mountain Climbers', sets: '3', reps: '30s', rest: '30s' },
            { name: 'Bulgarian Split Squats', sets: '3', reps: '10 each leg', rest: '45s' }
          ]
        },
        {
          day_of_week: 'Wednesday',
          title: 'Intermediate HIIT',
          exercises: [
            { name: 'Burpees', sets: '3', reps: '10-15', rest: '45s' },
            { name: 'Diamond Push-ups', sets: '3', reps: '8-12', rest: '45s' },
            { name: 'Jump Squats', sets: '3', reps: '20', rest: '30s' }
          ]
        }
      ];
    } else {
      return [
        {
          day_of_week: 'Monday',
          title: 'Advanced HIIT',
          exercises: [
            { name: 'Advanced Push-ups', sets: '4', reps: '15-25', rest: '30s' },
            { name: 'Pistol Squats', sets: '4', reps: '5-8 each leg', rest: '45s' },
            { name: 'Burpees', sets: '4', reps: '12-20', rest: '30s' },
            { name: 'Handstand Push-ups', sets: '3', reps: '5-10', rest: '60s' }
          ]
        },
        {
          day_of_week: 'Wednesday',
          title: 'Advanced Power',
          exercises: [
            { name: 'Plyometric Push-ups', sets: '4', reps: '8-12', rest: '60s' },
            { name: 'Jump Squats', sets: '4', reps: '25-30', rest: '45s' },
            { name: 'Mountain Climbers', sets: '4', reps: '45s', rest: '15s' }
          ]
        }
      ];
    }
  } else {
    // Muscle gain plans by fitness level
    if (fitnessLevel === 'beginner') {
      return [
        {
          day_of_week: 'Monday',
          title: 'Beginner Upper Body',
          exercises: [
            { name: 'Modified Push-ups', sets: '3', reps: '8-12', rest: '90s' },
            { name: 'Pike Push-ups', sets: '2', reps: '5-8', rest: '90s' },
            { name: 'Wall Sits', sets: '3', reps: '30-45s', rest: '60s' }
          ]
        },
        {
          day_of_week: 'Wednesday',
          title: 'Beginner Lower Body',
          exercises: [
            { name: 'Assisted Squats', sets: '3', reps: '12-15', rest: '90s' },
            { name: 'Wall Sits', sets: '3', reps: '30-60s', rest: '90s' },
            { name: 'Calf Raises', sets: '3', reps: '15-20', rest: '60s' }
          ]
        }
      ];
    } else if (fitnessLevel === 'intermediate') {
      return [
        {
          day_of_week: 'Monday',
          title: 'Intermediate Push',
          exercises: [
            { name: 'Push-ups', sets: '4', reps: '12-15', rest: '90s' },
            { name: 'Diamond Push-ups', sets: '3', reps: '8-12', rest: '90s' },
            { name: 'Pike Push-ups', sets: '3', reps: '8-12', rest: '90s' }
          ]
        },
        {
          day_of_week: 'Wednesday',
          title: 'Intermediate Legs',
          exercises: [
            { name: 'Squats', sets: '4', reps: '15-20', rest: '90s' },
            { name: 'Bulgarian Split Squats', sets: '3', reps: '10-12 each', rest: '90s' },
            { name: 'Jump Squats', sets: '3', reps: '12-15', rest: '90s' }
          ]
        }
      ];
    } else {
      return [
        {
          day_of_week: 'Monday',
          title: 'Advanced Push',
          exercises: [
            { name: 'Handstand Push-ups', sets: '4', reps: '8-12', rest: '2 min' },
            { name: 'Advanced Push-ups', sets: '4', reps: '15-20', rest: '90s' },
            { name: 'Pike Push-ups', sets: '4', reps: '12-15', rest: '90s' }
          ]
        },
        {
          day_of_week: 'Wednesday',
          title: 'Advanced Legs',
          exercises: [
            { name: 'Pistol Squats', sets: '4', reps: '8-10 each', rest: '2 min' },
            { name: 'Jump Squats', sets: '4', reps: '20-25', rest: '90s' },
            { name: 'Bulgarian Split Squats', sets: '4', reps: '15 each', rest: '90s' }
          ]
        }
      ];
    }
  }
};
