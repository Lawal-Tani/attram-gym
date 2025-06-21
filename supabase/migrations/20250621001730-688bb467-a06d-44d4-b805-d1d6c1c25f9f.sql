
-- Add subscription_plan and payment_method columns to the users table
ALTER TABLE public.users 
ADD COLUMN subscription_plan text DEFAULT 'basic',
ADD COLUMN payment_method text DEFAULT 'none';
