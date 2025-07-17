import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target } from 'lucide-react';
import ExerciseList from './ExerciseList';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest_time: string;
  order_index: number;
  equipment?: string;
  video?: {
    video_url: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    description?: string;
  };
}

interface WorkoutPlan {
  id: string;
  day_of_week: string;
  title: string;
  goal_type: string;
  fitness_level: string;
  exercises: Exercise[];
}

interface WorkoutCardProps {
  workout: WorkoutPlan;
  isToday: boolean;
  isCompleted: boolean;
  onComplete: (workoutPlanId: string, dayTitle: string) => void;
  onView?: (workoutPlanId: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, isToday, isCompleted, onComplete, onView }) => {
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

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setTimerActive(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };
  const pauseTimer = () => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const resetTimer = () => {
    setTimerActive(false);
    setSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Format seconds to mm:ss
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Card className={`${isToday ? 'ring-2 ring-accent bg-accent/5' : ''} ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader className="pb-4">
        <div className="space-y-3">
          {/* Title and Today Badge */}
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {workout.day_of_week}
              {isToday && <Badge className="bg-accent text-accent-foreground">Today</Badge>}
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
          </div>
          
          {/* Workout Title */}
          <CardDescription className="text-base font-medium text-foreground">
            {workout.title}
          </CardDescription>
          
          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={`capitalize text-xs ${
                workout.fitness_level === 'beginner' ? 'bg-green-100 text-green-700 border-green-300' :
                workout.fitness_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                workout.fitness_level === 'advanced' ? 'bg-red-100 text-red-700 border-red-300' :
                'bg-muted text-muted-foreground border-muted'
              }`}
            >
              <Target className="h-3 w-3 mr-1" />
              {workout.fitness_level}
            </Badge>
            <Badge variant="outline" className="text-xs text-accent border-accent bg-accent/10">
              {workout.goal_type.replace('_', ' ')}
            </Badge>
          </div>
          
          {/* Action Buttons - Mobile Optimized */}
          {!isCompleted && (
            <div className="space-y-2">
              {/* Primary Action */}
              <Button 
                onClick={() => onComplete(workout.id, workout.title)}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Workout
              </Button>
              
              {/* Secondary Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const firstVideo = workout.exercises.find(ex => ex.video?.video_url)?.video?.video_url;
                    if (firstVideo) {
                      window.open(firstVideo, '_blank');
                    } else {
                      const firstExercise = workout.exercises[0];
                      if (firstExercise) {
                        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(firstExercise.name + ' exercise tutorial')}`;
                        window.open(searchUrl, '_blank');
                      }
                    }
                  }}
                >
                  View Videos
                </Button>
                <Button 
                  variant={timerActive ? 'default' : 'outline'} 
                  size="sm"
                  onClick={timerActive ? pauseTimer : startTimer}
                >
                  {timerActive ? 'Pause' : 'Start Timer'}
                </Button>
              </div>
            </div>
          )}
          
          {/* Timer Display */}
          {(timerActive || seconds > 0) && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <span className="font-mono text-lg font-semibold">{formatTime(seconds)}</span>
              <Button size="sm" variant="ghost" onClick={resetTimer}>
                Reset
              </Button>
            </div>
          )}
          
          {/* Completed Badge */}
          {isCompleted && (
            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
                ✓ Workout Completed
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ExerciseList exercises={workout.exercises} />
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
