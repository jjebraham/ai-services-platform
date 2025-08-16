-- Fix Supabase schema to match auth service requirements
-- Run this in your Supabase SQL Editor

-- First, let's modify the user_profiles table to match auth service expectations
-- Add missing columns that auth service expects
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS auth_user_id UUID,
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS is_google_user BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Update existing data to have full_name from first_name and last_name
UPDATE public.user_profiles 
SET full_name = COALESCE(first_name || ' ' || last_name, first_name, last_name, '')
WHERE full_name IS NULL;

-- Make email NOT NULL if it isn't already
ALTER TABLE public.user_profiles 
ALTER COLUMN email SET NOT NULL;

-- Create an index on auth_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON public.user_profiles(google_id);

-- Update the auto profile creation function to work with our schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    full_name,
    auth_user_id,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      TRIM(
        COALESCE(NEW.raw_user_meta_data->>'first_name', '') || ' ' || 
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      NEW.email
    ),
    NEW.id,
    'user',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up any duplicate demo users that might have been created incorrectly
DELETE FROM public.user_profiles 
WHERE email IN ('demo@example.com', 'demo@aiservices.com', 'admin@aiservices.com')
AND (full_name IS NULL OR full_name = '');

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
