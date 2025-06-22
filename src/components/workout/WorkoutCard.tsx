
import React from 'react';
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

interface WorkoutCardProps {
  workout: WorkoutPlan;
  isToday: boolean;
  isCompleted: boolean;
  onComplete: (workoutPlanId: string, dayTitle: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, isToday, isCompleted, onComplete }) => {
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

  return (
    <Card className={`${isToday ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''} ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {workout.day_of_week}
              {isToday && <Badge className="bg-emerald-500">Today</Badge>}
              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-gray-700 mb-2">
              {workout.title}
            </CardDescription>
            <div className="flex gap-2">
              <Badge 
                variant="outline" 
                className={`capitalize ${getFitnessLevelColor(workout.fitness_level)}`}
              >
                <Target className="h-3 w-3 mr-1" />
                {workout.fitness_level}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                {workout.goal_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          {!isCompleted && (
            <Button 
              onClick={() => onComplete(workout.id, workout.title)}
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
        <ExerciseList exercises={workout.exercises} />
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;
