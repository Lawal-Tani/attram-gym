
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
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
  exercises: Exercise[];
}

interface WorkoutCardProps {
  workout: WorkoutPlan;
  isToday: boolean;
  isCompleted: boolean;
  onComplete: (workoutPlanId: string, dayTitle: string) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, isToday, isCompleted, onComplete }) => {
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
            <CardDescription className="text-lg font-medium text-gray-700">
              {workout.title}
            </CardDescription>
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
