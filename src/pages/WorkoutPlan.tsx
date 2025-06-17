
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

interface WorkoutDay {
  day: string;
  title: string;
  exercises: Exercise[];
  completed?: boolean;
}

const WorkoutPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[]>([]);

  // Workout plans based on goals
  const weightLossPlan: WorkoutDay[] = [
    {
      day: 'Monday',
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
      day: 'Tuesday',
      title: 'Cardio & Core',
      exercises: [
        { name: 'Burpees', sets: '3', reps: '8-12', rest: '60s' },
        { name: 'Russian Twists', sets: '3', reps: '20', rest: '30s' },
        { name: 'High Knees', sets: '3', reps: '30 seconds', rest: '30s' },
        { name: 'Bicycle Crunches', sets: '3', reps: '20', rest: '30s' },
        { name: 'Jump Rope', sets: '3', reps: '60 seconds', rest: '60s' }
      ]
    },
    {
      day: 'Wednesday',
      title: 'Upper Body HIIT',
      exercises: [
        { name: 'Push-up to T', sets: '3', reps: '8-10', rest: '45s' },
        { name: 'Tricep Dips', sets: '3', reps: '10-15', rest: '45s' },
        { name: 'Pike Push-ups', sets: '3', reps: '8-12', rest: '45s' },
        { name: 'Arm Circles', sets: '3', reps: '30 seconds', rest: '30s' },
        { name: 'Wall Sit', sets: '3', reps: '30-60s', rest: '60s' }
      ]
    },
    {
      day: 'Thursday',
      title: 'Lower Body Burn',
      exercises: [
        { name: 'Jump Squats', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Lunges', sets: '3', reps: '10 each leg', rest: '45s' },
        { name: 'Calf Raises', sets: '3', reps: '20', rest: '30s' },
        { name: 'Glute Bridges', sets: '3', reps: '15-20', rest: '45s' },
        { name: 'Side Lunges', sets: '3', reps: '10 each', rest: '45s' }
      ]
    },
    {
      day: 'Friday',
      title: 'Full Body Metabolic',
      exercises: [
        { name: 'Squat to Press', sets: '3', reps: '10-12', rest: '45s' },
        { name: 'Deadlift to Row', sets: '3', reps: '10-12', rest: '45s' },
        { name: 'Thrusters', sets: '3', reps: '8-10', rest: '60s' },
        { name: 'Battle Ropes', sets: '3', reps: '30 seconds', rest: '60s' },
        { name: 'Plank Jacks', sets: '3', reps: '15', rest: '45s' }
      ]
    },
    {
      day: 'Saturday',
      title: 'Active Recovery',
      exercises: [
        { name: 'Walking', sets: '1', reps: '30-45 min', rest: 'N/A' },
        { name: 'Stretching', sets: '1', reps: '15 min', rest: 'N/A' },
        { name: 'Yoga Flow', sets: '1', reps: '20 min', rest: 'N/A' },
        { name: 'Foam Rolling', sets: '1', reps: '10 min', rest: 'N/A' }
      ]
    }
  ];

  const muscleGainPlan: WorkoutDay[] = [
    {
      day: 'Monday',
      title: 'Chest & Triceps',
      exercises: [
        { name: 'Bench Press', sets: '4', reps: '8-10', rest: '90s' },
        { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', rest: '60s' },
        { name: 'Dips', sets: '3', reps: '10-15', rest: '60s' },
        { name: 'Tricep Extensions', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Push-ups', sets: '3', reps: 'To failure', rest: '60s' }
      ]
    },
    {
      day: 'Tuesday',
      title: 'Back & Biceps',
      exercises: [
        { name: 'Deadlifts', sets: '4', reps: '6-8', rest: '2 min' },
        { name: 'Pull-ups/Lat Pulldown', sets: '3', reps: '8-12', rest: '90s' },
        { name: 'Barbell Rows', sets: '3', reps: '10-12', rest: '60s' },
        { name: 'Barbell Curls', sets: '3', reps: '10-12', rest: '45s' },
        { name: 'Hammer Curls', sets: '3', reps: '12-15', rest: '45s' }
      ]
    },
    {
      day: 'Wednesday',
      title: 'Legs & Glutes',
      exercises: [
        { name: 'Squats', sets: '4', reps: '8-10', rest: '2 min' },
        { name: 'Romanian Deadlifts', sets: '3', reps: '10-12', rest: '90s' },
        { name: 'Leg Press', sets: '3', reps: '12-15', rest: '60s' },
        { name: 'Leg Curls', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Calf Raises', sets: '4', reps: '15-20', rest: '45s' }
      ]
    },
    {
      day: 'Thursday',
      title: 'Shoulders & Abs',
      exercises: [
        { name: 'Overhead Press', sets: '4', reps: '8-10', rest: '90s' },
        { name: 'Lateral Raises', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Rear Delt Flyes', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Planks', sets: '3', reps: '60s', rest: '60s' },
        { name: 'Russian Twists', sets: '3', reps: '20', rest: '30s' }
      ]
    },
    {
      day: 'Friday',
      title: 'Arms & Core',
      exercises: [
        { name: 'Close-Grip Bench Press', sets: '3', reps: '10-12', rest: '60s' },
        { name: 'Preacher Curls', sets: '3', reps: '10-12', rest: '60s' },
        { name: 'Overhead Tricep Extension', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Cable Curls', sets: '3', reps: '12-15', rest: '45s' },
        { name: 'Hanging Leg Raises', sets: '3', reps: '10-15', rest: '60s' }
      ]
    },
    {
      day: 'Saturday',
      title: 'Full Body Power',
      exercises: [
        { name: 'Power Cleans', sets: '4', reps: '5', rest: '2 min' },
        { name: 'Thrusters', sets: '3', reps: '8-10', rest: '90s' },
        { name: 'Pull-ups', sets: '3', reps: 'Max reps', rest: '90s' },
        { name: 'Push Press', sets: '3', reps: '8-10', rest: '60s' },
        { name: 'Farmer\'s Walk', sets: '3', reps: '30s', rest: '60s' }
      ]
    }
  ];

  useEffect(() => {
    // Set workout plan based on user goal
    if (user?.goal === 'weight_loss') {
      setWorkoutPlan(weightLossPlan);
    } else {
      setWorkoutPlan(muscleGainPlan);
    }

    // Load completed workouts
    const saved = localStorage.getItem(`workouts_${user?.id}`);
    if (saved) {
      setCompletedWorkouts(JSON.parse(saved));
    }
  }, [user]);

  const markWorkoutComplete = (day: string) => {
    const today = new Date().toISOString().split('T')[0];
    const workoutKey = `${day}_${today}`;
    
    if (!completedWorkouts.includes(workoutKey)) {
      const updated = [...completedWorkouts, workoutKey];
      setCompletedWorkouts(updated);
      localStorage.setItem(`workouts_${user?.id}`, JSON.stringify(updated));
      
      toast({
        title: "Workout Completed! 🎉",
        description: `Great job completing your ${day} workout!`,
      });
    }
  };

  const isWorkoutCompleted = (day: string) => {
    const today = new Date().toISOString().split('T')[0];
    const workoutKey = `${day}_${today}`;
    return completedWorkouts.includes(workoutKey);
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Your Workout Plan
          </h1>
          <p className="text-gray-600">
            Personalized for {user?.goal === 'weight_loss' ? 'weight loss' : 'muscle gain'} • Today is {currentDay}
          </p>
        </div>

        <div className="grid gap-6">
          {workoutPlan.map((workout, index) => {
            const isToday = workout.day === currentDay;
            const isCompleted = isWorkoutCompleted(workout.day);
            
            return (
              <Card key={index} className={`${isToday ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''} ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {workout.day}
                        {isToday && <Badge className="bg-emerald-500">Today</Badge>}
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription className="text-lg font-medium text-gray-700">
                        {workout.title}
                      </CardDescription>
                    </div>
                    {!isCompleted && (
                      <Button 
                        onClick={() => markWorkoutComplete(workout.day)}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </Button>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{exercise.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {exercise.sets} sets
                            </span>
                            <span>•</span>
                            <span>{exercise.reps} reps</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {exercise.rest} rest
                            </span>
                          </div>
                        </div>
                        <Circle className="h-5 w-5 text-gray-300" />
                      </div>
                    ))}
                  </div>
                  
                  {workout.day === 'Saturday' && workout.title === 'Active Recovery' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Recovery Day:</strong> Focus on light activity and mobility. Listen to your body and rest as needed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">📋 Workout Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Before You Start:</h4>
              <ul className="space-y-1">
                <li>• Always warm up for 5-10 minutes</li>
                <li>• Stay hydrated throughout your workout</li>
                <li>• Use proper form over heavy weights</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">After Your Workout:</h4>
              <ul className="space-y-1">
                <li>• Cool down with light stretching</li>
                <li>• Track your progress</li>
                <li>• Get adequate rest for recovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlan;
