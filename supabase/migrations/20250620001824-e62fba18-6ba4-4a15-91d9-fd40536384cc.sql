
-- Create a table for exercise videos
CREATE TABLE public.exercise_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_name TEXT NOT NULL UNIQUE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default exercise videos
INSERT INTO public.exercise_videos (exercise_name, video_url, thumbnail_url, description) VALUES
('Jumping Jacks', 'https://www.youtube.com/watch?v=2W4ZNSwoW_4', 'https://img.youtube.com/vi/2W4ZNSwoW_4/maxresdefault.jpg', 'Full body cardio exercise'),
('Push-ups', 'https://www.youtube.com/watch?v=IODxDxX7oi4', 'https://img.youtube.com/vi/IODxDxX7oi4/maxresdefault.jpg', 'Upper body strength exercise'),
('Squats', 'https://www.youtube.com/watch?v=YaXPRqUwItQ', 'https://img.youtube.com/vi/YaXPRqUwItQ/maxresdefault.jpg', 'Lower body strength exercise'),
('Mountain Climbers', 'https://www.youtube.com/watch?v=wQq3ybaLAuE', 'https://img.youtube.com/vi/wQq3ybaLAuE/maxresdefault.jpg', 'Core and cardio exercise'),
('Plank', 'https://www.youtube.com/watch?v=pSHjTRCQxIw', 'https://img.youtube.com/vi/pSHjTRCQxIw/maxresdefault.jpg', 'Core stability exercise'),
('Bench Press', 'https://www.youtube.com/watch?v=rT7DgCr-3pg', 'https://img.youtube.com/vi/rT7DgCr-3pg/maxresdefault.jpg', 'Chest strength exercise'),
('Incline Dumbbell Press', 'https://www.youtube.com/watch?v=8iPEnn-ltC8', 'https://img.youtube.com/vi/8iPEnn-ltC8/maxresdefault.jpg', 'Upper chest exercise'),
('Dips', 'https://www.youtube.com/watch?v=2z8JmcrW-As', 'https://img.youtube.com/vi/2z8JmcrW-As/maxresdefault.jpg', 'Tricep and chest exercise'),
('Tricep Extensions', 'https://www.youtube.com/watch?v=L4YjTkyaUAA', 'https://img.youtube.com/vi/L4YjTkyaUAA/maxresdefault.jpg', 'Tricep isolation exercise'),
('Burpees', 'https://www.youtube.com/watch?v=TU8QYVW0gDU', 'https://img.youtube.com/vi/TU8QYVW0gDU/maxresdefault.jpg', 'Full body HIIT exercise'),
('Russian Twists', 'https://www.youtube.com/watch?v=wkD8rjkodUI', 'https://img.youtube.com/vi/wkD8rjkodUI/maxresdefault.jpg', 'Core rotation exercise'),
('High Knees', 'https://www.youtube.com/watch?v=8opcQdC-V-U', 'https://img.youtube.com/vi/8opcQdC-V-U/maxresdefault.jpg', 'Cardio exercise'),
('Bicycle Crunches', 'https://www.youtube.com/watch?v=9FGilxCbdz8', 'https://img.youtube.com/vi/9FGilxCbdz8/maxresdefault.jpg', 'Core exercise'),
('Deadlifts', 'https://www.youtube.com/watch?v=ytGaGIn3SjE', 'https://img.youtube.com/vi/ytGaGIn3SjE/maxresdefault.jpg', 'Full body strength exercise'),
('Pull-ups', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 'https://img.youtube.com/vi/eGo4IYlbE5g/maxresdefault.jpg', 'Back and bicep exercise'),
('Barbell Rows', 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ', 'https://img.youtube.com/vi/FWJR5Ve8bnQ/maxresdefault.jpg', 'Back strength exercise'),
('Barbell Curls', 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', 'https://img.youtube.com/vi/ykJmrZ5v0Oo/maxresdefault.jpg', 'Bicep exercise');

-- Enable RLS for exercise videos (make it publicly readable but only admins can modify)
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

-- Create policy that allows everyone to view exercise videos
CREATE POLICY "Anyone can view exercise videos" 
  ON public.exercise_videos 
  FOR SELECT 
  USING (true);

-- Create policy that only allows admins to modify exercise videos
CREATE POLICY "Only admins can modify exercise videos" 
  ON public.exercise_videos 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));
