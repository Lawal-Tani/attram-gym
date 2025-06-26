import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Repeat, Hash } from 'lucide-react';

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

interface ExerciseListProps {
  exercises: Exercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
  const openVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      {exercises.map((exercise, index) => (
        <Card key={exercise.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <h3 className="font-semibold text-lg">{exercise.name}</h3>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Hash className="w-4 h-4" />
                    <span>{exercise.sets} sets</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Repeat className="w-4 h-4" />
                    <span>{exercise.reps} reps</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.rest_time} rest</span>
                  </div>
                </div>
              </div>
              
              {exercise.video?.video_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openVideo(exercise.video.video_url)}
                  className="ml-4"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExerciseList;
