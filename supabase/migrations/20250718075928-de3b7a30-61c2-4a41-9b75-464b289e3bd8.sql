-- Add equipment-based workout plans and exercises for variety

-- Create equipment-based workout plans for each fitness level and day
INSERT INTO workout_plans (title, day_of_week, fitness_level, goal_type) VALUES
('Strength Training - Monday', 'Monday', 'beginner', 'muscle_gain'),
('Weight Training - Monday', 'Monday', 'intermediate', 'muscle_gain'),
('Heavy Lifting - Monday', 'Monday', 'advanced', 'muscle_gain'),
('Cardio Equipment - Tuesday', 'Tuesday', 'beginner', 'weight_loss'),
('HIIT Training - Tuesday', 'Tuesday', 'intermediate', 'weight_loss'),
('Advanced Cardio - Tuesday', 'Tuesday', 'advanced', 'weight_loss'),
('Resistance Training - Wednesday', 'Wednesday', 'beginner', 'muscle_gain'),
('Gym Circuit - Wednesday', 'Wednesday', 'intermediate', 'muscle_gain'),
('Power Training - Wednesday', 'Wednesday', 'advanced', 'muscle_gain'),
('Equipment Cardio - Thursday', 'Thursday', 'beginner', 'weight_loss'),
('Interval Training - Thursday', 'Thursday', 'intermediate', 'weight_loss'),
('Elite Cardio - Thursday', 'Thursday', 'advanced', 'weight_loss'),
('Strength Circuit - Saturday', 'Saturday', 'beginner', 'muscle_gain'),
('Power Circuit - Saturday', 'Saturday', 'intermediate', 'muscle_gain'),
('Elite Training - Saturday', 'Saturday', 'advanced', 'muscle_gain'),
('Recovery Cardio - Sunday', 'Sunday', 'beginner', 'weight_loss'),
('Active Recovery - Sunday', 'Sunday', 'intermediate', 'weight_loss'),
('Elite Recovery - Sunday', 'Sunday', 'advanced', 'weight_loss');

-- Add exercises for equipment-based workouts
-- Monday Strength Training (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Dumbbell Bench Press', '3', '12-15', '60 seconds', 'dumbbells', 1, id FROM workout_plans WHERE title = 'Strength Training - Monday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Dumbbell Rows', '3', '12-15', '60 seconds', 'dumbbells', 2, id FROM workout_plans WHERE title = 'Strength Training - Monday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Dumbbell Squats', '3', '15', '60 seconds', 'dumbbells', 3, id FROM workout_plans WHERE title = 'Strength Training - Monday';

-- Monday Weight Training (Intermediate)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Barbell Bench Press', '4', '8-10', '90 seconds', 'barbell', 1, id FROM workout_plans WHERE title = 'Weight Training - Monday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Barbell Rows', '4', '8-10', '90 seconds', 'barbell', 2, id FROM workout_plans WHERE title = 'Weight Training - Monday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Barbell Squats', '4', '10', '2 minutes', 'barbell', 3, id FROM workout_plans WHERE title = 'Weight Training - Monday';

-- Monday Heavy Lifting (Advanced)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Heavy Bench Press', '5', '5-6', '3 minutes', 'barbell', 1, id FROM workout_plans WHERE title = 'Heavy Lifting - Monday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Deadlifts', '5', '5', '3 minutes', 'barbell', 2, id FROM workout_plans WHERE title = 'Heavy Lifting - Monday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Heavy Squats', '5', '5-6', '3 minutes', 'barbell', 3, id FROM workout_plans WHERE title = 'Heavy Lifting - Monday';

-- Tuesday Cardio Equipment (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Treadmill Walking', '1', '20 minutes', '2 minutes', 'treadmill', 1, id FROM workout_plans WHERE title = 'Cardio Equipment - Tuesday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Stationary Bike', '1', '15 minutes', '2 minutes', 'bike', 2, id FROM workout_plans WHERE title = 'Cardio Equipment - Tuesday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Elliptical', '1', '10 minutes', '2 minutes', 'elliptical', 3, id FROM workout_plans WHERE title = 'Cardio Equipment - Tuesday';

-- Tuesday HIIT Training (Intermediate)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Treadmill Intervals', '6', '2 minutes', '1 minute', 'treadmill', 1, id FROM workout_plans WHERE title = 'HIIT Training - Tuesday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Rowing Machine', '4', '5 minutes', '2 minutes', 'rowing_machine', 2, id FROM workout_plans WHERE title = 'HIIT Training - Tuesday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Bike Sprints', '8', '30 seconds', '30 seconds', 'bike', 3, id FROM workout_plans WHERE title = 'HIIT Training - Tuesday';

-- Add some resistance band workouts for variety
-- Wednesday Resistance Training (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Resistance Band Chest Press', '3', '15', '45 seconds', 'resistance_bands', 1, id FROM workout_plans WHERE title = 'Resistance Training - Wednesday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Resistance Band Rows', '3', '15', '45 seconds', 'resistance_bands', 2, id FROM workout_plans WHERE title = 'Resistance Training - Wednesday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Resistance Band Squats', '3', '20', '45 seconds', 'resistance_bands', 3, id FROM workout_plans WHERE title = 'Resistance Training - Wednesday';

-- Add more exercises for other equipment-based workouts
-- Saturday Strength Circuit (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Kettlebell Swings', '3', '20', '60 seconds', 'kettlebell', 1, id FROM workout_plans WHERE title = 'Strength Circuit - Saturday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Medicine Ball Slams', '3', '15', '60 seconds', 'medicine_ball', 2, id FROM workout_plans WHERE title = 'Strength Circuit - Saturday';

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Cable Pulls', '3', '12', '60 seconds', 'cable_machine', 3, id FROM workout_plans WHERE title = 'Strength Circuit - Saturday';