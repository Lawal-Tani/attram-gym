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
    <Card className={`${isToday ? 'ring-2 ring-accent bg-accent/20' : ''} ${isCompleted ? 'bg-accent/10 border-green-200' : ''}`}>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              {workout.day_of_week}
              {isToday && <Badge className="bg-emerald-500 text-white">Today</Badge>}
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-foreground mb-2 truncate">
              {workout.title}
            </CardDescription>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={`capitalize border-2 ${
                  workout.fitness_level === 'beginner' ? 'bg-green-700 text-green-100 border-green-700' :
                  workout.fitness_level === 'intermediate' ? 'bg-yellow-500 text-yellow-900 border-yellow-500' :
                  workout.fitness_level === 'advanced' ? 'bg-red-700 text-red-100 border-red-700' :
                  'bg-muted text-muted-foreground border-muted'
                }`}
              >
                <Target className="h-3 w-3 mr-1" />
                {workout.fitness_level}
              </Badge>
              <Badge variant="outline" className="text-accent border-accent bg-accent/10">
                {workout.goal_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end w-full md:w-auto">
            {!isCompleted && (
              <div className="flex flex-wrap gap-2 justify-end">
                <Button 
                  onClick={() => onComplete(workout.id, workout.title)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </Button>
                <Button variant="outline" 
                  onClick={() => {
                    const firstVideo = workout.exercises.find(ex => ex.video?.video_url)?.video?.video_url;
                    if (firstVideo) {
                      window.open(firstVideo, '_blank');
                    } else {
                      // Fallback to search for exercise videos by name
                      const firstExercise = workout.exercises[0];
                      if (firstExercise) {
                        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(firstExercise.name + ' exercise tutorial')}`;
                        window.open(searchUrl, '_blank');
                      }
                    }
                  }}
                >
                  View Workout
                </Button>
                <Button variant={timerActive ? 'default' : 'outline'} onClick={timerActive ? pauseTimer : startTimer}>
                  {timerActive ? 'Pause' : 'Start Workout'}
                </Button>
              </div>
            )}
            {timerActive || seconds > 0 ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-mono text-lg">{formatTime(seconds)}</span>
                <Button size="sm" variant="ghost" onClick={resetTimer}>Reset</Button>
              </div>
            ) : null}
            {isCompleted && (
              <Badge variant="outline" className="text-green-400 border-green-700 bg-accent/10">
                ✓ Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ExerciseList exercises={workout.exercises} />
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
