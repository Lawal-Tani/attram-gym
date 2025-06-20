
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock, Target, Play } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutPlans } from '@/hooks/useWorkoutPlans';
import { supabase } from '@/integrations/supabase/client';

const WorkoutPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { workoutPlans, loading, error } = useWorkoutPlans();
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>([]);

  React.useEffect(() => {
    if (user) {
      // Load completed workouts from today
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

  const openVideoInNewTab = (videoUrl: string | undefined) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getVideoThumbnail = (videoUrl: string | undefined) => {
    if (!videoUrl) return null;
    
    // Extract YouTube video ID and create thumbnail URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = videoUrl.match(youtubeRegex);
    
    if (match) {
      const videoId = match[1];
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            <p>Error loading workout plans: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
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
          <p className="text-gray-600">
            Personalized for {user?.goal === 'weight_loss' ? 'weight loss' : 'muscle gain'} • Today is {currentDay}
          </p>
        </div>

        <div className="grid gap-6">
          {workoutPlans.map((workout) => {
            const isToday = workout.day_of_week === currentDay;
            const isCompleted = isWorkoutCompleted(workout.id);
            
            return (
              <Card key={workout.id} className={`${isToday ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''} ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {workout.day_of_week}
                        {isToday && <Badge className="bg-emerald-500">Today</Badge>}
                        {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <CardDescription className="text-lg font-medium text-gray-700">
                        {workout.title}
                      </CardDescription>
                    </div>
                    {!isCompleted && (
                      <Button 
                        onClick={() => markWorkoutComplete(workout.id, workout.title)}
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
                    {workout.exercises.map((exercise) => {
                      const thumbnailUrl = getVideoThumbnail(exercise.video_url);
                      
                      return (
                        <div key={exercise.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-4">
                            {thumbnailUrl && (
                              <div 
                                className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openVideoInNewTab(exercise.video_url)}
                              >
                                <img 
                                  src={thumbnailUrl} 
                                  alt={`${exercise.name} demo`}
                                  className="w-16 h-12 object-cover rounded"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Play className="h-6 w-6 text-white drop-shadow-lg" />
                                </div>
                              </div>
                            )}
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
                                  {exercise.rest_time} rest
                                </span>
                              </div>
                            </div>
                          </div>
                          <Circle className="h-5 w-5 text-gray-300" />
                        </div>
                      );
                    })}
                  </div>
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
