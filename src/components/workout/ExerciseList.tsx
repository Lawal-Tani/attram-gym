
import React from 'react';
import { Circle, Target, Clock, Play } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest_time: string;
  order_index: number;
  video_url?: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises }) => {
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

  return (
    <div className="space-y-4">
      {exercises.map((exercise) => {
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
  );
};

export default ExerciseList;
