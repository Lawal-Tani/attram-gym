-- Add exercises for beginner workout plans that are missing them

-- Monday: Chest & Triceps (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Push-ups', '2', '10', '45 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Chest & Triceps' AND fitness_level = 'beginner' AND day_of_week = 'Monday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Chair Dips', '2', '8', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Chest & Triceps' AND fitness_level = 'beginner' AND day_of_week = 'Monday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Arm Circles', '2', '15', '30 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Chest & Triceps' AND fitness_level = 'beginner' AND day_of_week = 'Monday' LIMIT 1;

-- Monday: Full Body Circuit (one of them)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Bodyweight Squats', '3', '12', '45 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Full Body Circuit' AND fitness_level = 'beginner' AND day_of_week = 'Monday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Push-ups', '3', '10', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Full Body Circuit' AND fitness_level = 'beginner' AND day_of_week = 'Monday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Plank Hold', '3', '20 seconds', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Full Body Circuit' AND fitness_level = 'beginner' AND day_of_week = 'Monday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

-- Tuesday: Back & Biceps (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Superman', '3', '12', '45 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Back & Biceps' AND fitness_level = 'beginner' AND day_of_week = 'Tuesday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Reverse Fly', '3', '10', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Back & Biceps' AND fitness_level = 'beginner' AND day_of_week = 'Tuesday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Angels', '3', '15', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Back & Biceps' AND fitness_level = 'beginner' AND day_of_week = 'Tuesday' LIMIT 1;

-- Tuesday: Cardio & Core (one without exercises)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Marching in Place', '3', '30 seconds', '30 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Cardio & Core' AND fitness_level = 'beginner' AND day_of_week = 'Tuesday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Modified Plank', '3', '15 seconds', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Cardio & Core' AND fitness_level = 'beginner' AND day_of_week = 'Tuesday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Standing Side Bends', '3', '12', '30 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Cardio & Core' AND fitness_level = 'beginner' AND day_of_week = 'Tuesday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

-- Wednesday: Upper Body HIIT (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Push-ups', '4', '8', '30 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Upper Body HIIT' AND fitness_level = 'beginner' AND day_of_week = 'Wednesday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Arm Circles', '4', '20 seconds', '30 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Upper Body HIIT' AND fitness_level = 'beginner' AND day_of_week = 'Wednesday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Chair Dips', '4', '6', '30 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Upper Body HIIT' AND fitness_level = 'beginner' AND day_of_week = 'Wednesday' LIMIT 1;

-- Wednesday: Legs & Glutes (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Bodyweight Squats', '3', '15', '60 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Legs & Glutes' AND fitness_level = 'beginner' AND day_of_week = 'Wednesday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Glute Bridges', '3', '12', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Legs & Glutes' AND fitness_level = 'beginner' AND day_of_week = 'Wednesday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Calf Raises', '3', '20', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Legs & Glutes' AND fitness_level = 'beginner' AND day_of_week = 'Wednesday' LIMIT 1;

-- Thursday: Shoulders & Abs (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Arm Circles', '3', '20', '45 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Shoulders & Abs' AND fitness_level = 'beginner' AND day_of_week = 'Thursday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Modified Plank', '3', '20 seconds', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Shoulders & Abs' AND fitness_level = 'beginner' AND day_of_week = 'Thursday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Standing Crunches', '3', '15', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Shoulders & Abs' AND fitness_level = 'beginner' AND day_of_week = 'Thursday' LIMIT 1;

-- Thursday: Lower Body Burn (one without exercises)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Sits', '3', '15 seconds', '60 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Lower Body Burn' AND fitness_level = 'beginner' AND day_of_week = 'Thursday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Step-ups (using stairs)', '3', '10 each leg', '60 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Lower Body Burn' AND fitness_level = 'beginner' AND day_of_week = 'Thursday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Glute Bridges', '3', '15', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Lower Body Burn' AND fitness_level = 'beginner' AND day_of_week = 'Thursday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

-- Thursday: Equipment Cardio (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Treadmill Walk', '1', '15 minutes', '2 minutes', 'treadmill', 1, id FROM workout_plans WHERE title = 'Equipment Cardio - Thursday' AND fitness_level = 'beginner' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Stationary Bike Easy', '1', '10 minutes', '2 minutes', 'bike', 2, id FROM workout_plans WHERE title = 'Equipment Cardio - Thursday' AND fitness_level = 'beginner' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Stretching', '1', '5 minutes', 'none', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Equipment Cardio - Thursday' AND fitness_level = 'beginner' LIMIT 1;

-- Friday: Arms & Core (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Push-ups', '3', '10', '45 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Arms & Core' AND fitness_level = 'beginner' AND day_of_week = 'Friday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Chair Dips', '3', '8', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Arms & Core' AND fitness_level = 'beginner' AND day_of_week = 'Friday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Modified Plank', '3', '20 seconds', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Arms & Core' AND fitness_level = 'beginner' AND day_of_week = 'Friday' LIMIT 1;

-- Friday: Full Body Metabolic (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Marching in Place', '3', '30 seconds', '30 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Full Body Metabolic' AND fitness_level = 'beginner' AND day_of_week = 'Friday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Bodyweight Squats', '3', '12', '45 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Full Body Metabolic' AND fitness_level = 'beginner' AND day_of_week = 'Friday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Push-ups', '3', '10', '45 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Full Body Metabolic' AND fitness_level = 'beginner' AND day_of_week = 'Friday' LIMIT 1;

-- Saturday: Full Body Power (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Bodyweight Squats', '3', '15', '60 seconds', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Full Body Power' AND fitness_level = 'beginner' AND day_of_week = 'Saturday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Wall Push-ups', '3', '12', '60 seconds', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Full Body Power' AND fitness_level = 'beginner' AND day_of_week = 'Saturday' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Modified Plank', '3', '25 seconds', '60 seconds', 'bodyweight', 3, id FROM workout_plans WHERE title = 'Full Body Power' AND fitness_level = 'beginner' AND day_of_week = 'Saturday' LIMIT 1;

-- Saturday: Active Recovery (one without exercises)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Light Walking', '1', '10 minutes', '2 minutes', 'bodyweight', 1, id FROM workout_plans WHERE title = 'Active Recovery' AND fitness_level = 'beginner' AND day_of_week = 'Saturday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Gentle Stretching', '1', '15 minutes', 'none', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Active Recovery' AND fitness_level = 'beginner' AND day_of_week = 'Saturday' AND id NOT IN (SELECT DISTINCT workout_plan_id FROM exercises WHERE workout_plan_id IS NOT NULL) LIMIT 1;

-- Sunday: Recovery Cardio (Beginner)
INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Easy Treadmill Walk', '1', '20 minutes', '2 minutes', 'treadmill', 1, id FROM workout_plans WHERE title = 'Recovery Cardio - Sunday' AND fitness_level = 'beginner' LIMIT 1;

INSERT INTO exercises (name, sets, reps, rest_time, equipment, order_index, workout_plan_id)
SELECT 'Light Stretching', '1', '10 minutes', 'none', 'bodyweight', 2, id FROM workout_plans WHERE title = 'Recovery Cardio - Sunday' AND fitness_level = 'beginner' LIMIT 1;