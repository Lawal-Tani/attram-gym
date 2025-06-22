
-- Add fitness_level column to users table
ALTER TABLE public.users 
ADD COLUMN fitness_level text DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced'));

-- Add fitness_level column to workout_plans table
ALTER TABLE public.workout_plans 
ADD COLUMN fitness_level text DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced'));

-- Update existing users to have a default fitness level
UPDATE public.users 
SET fitness_level = 'beginner' 
WHERE fitness_level IS NULL;

-- Update existing workout plans to have a default fitness level
UPDATE public.workout_plans 
SET fitness_level = 'beginner' 
WHERE fitness_level IS NULL;

-- Add more exercise videos for different fitness levels
INSERT INTO public.exercise_videos (exercise_name, video_url, thumbnail_url, description) VALUES
('Modified Push-ups', 'https://www.youtube.com/watch?v=jWxvty2KROs', 'https://img.youtube.com/vi/jWxvty2KROs/maxresdefault.jpg', 'Beginner-friendly push-up variations'),
('Wall Sits', 'https://www.youtube.com/watch?v=y-wV4Venusw', 'https://img.youtube.com/vi/y-wV4Venusw/maxresdefault.jpg', 'Beginner leg strengthening exercise'),
('Assisted Squats', 'https://www.youtube.com/watch?v=YaXPRqUwItQ', 'https://img.youtube.com/vi/YaXPRqUwItQ/maxresdefault.jpg', 'Beginner squat variations'),
('Advanced Push-ups', 'https://www.youtube.com/watch?v=44ScXWFaVBs', 'https://img.youtube.com/vi/44ScXWFaVBs/maxresdefault.jpg', 'Advanced push-up variations'),
('Pistol Squats', 'https://www.youtube.com/watch?v=vq5-vdgJc0I', 'https://img.youtube.com/vi/vq5-vdgJc0I/maxresdefault.jpg', 'Advanced single-leg squats'),
('Handstand Push-ups', 'https://www.youtube.com/watch?v=tQhrk6WMcKw', 'https://img.youtube.com/vi/tQhrk6WMcKw/maxresdefault.jpg', 'Advanced upper body exercise'),
('Bulgarian Split Squats', 'https://www.youtube.com/watch?v=2C-uNgKwPLE', 'https://img.youtube.com/vi/2C-uNgKwPLE/maxresdefault.jpg', 'Intermediate leg exercise'),
('Diamond Push-ups', 'https://www.youtube.com/watch?v=J0DnG1_S92I', 'https://img.youtube.com/vi/J0DnG1_S92I/maxresdefault.jpg', 'Intermediate tricep-focused push-ups'),
('Jump Squats', 'https://www.youtube.com/watch?v=CVaEhXotL7M', 'https://img.youtube.com/vi/CVaEhXotL7M/maxresdefault.jpg', 'Intermediate plyometric exercise'),
('Pike Push-ups', 'https://www.youtube.com/watch?v=spoSDijOW2k', 'https://img.youtube.com/vi/spoSDijOW2k/maxresdefault.jpg', 'Intermediate shoulder exercise');
