-- Run this in your Supabase SQL Editor

-- 1. Ensure columns exist (Safely add if missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'high_score') THEN
        ALTER TABLE public.profiles ADD COLUMN high_score integer default 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'games_played') THEN
        ALTER TABLE public.profiles ADD COLUMN games_played integer default 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_distance') THEN
        ALTER TABLE public.profiles ADD COLUMN total_distance float default 0;
    END IF;
END $$;

-- 2. Ensure RLS allows updates
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );
  
-- 3. Verify it works
SELECT * FROM profiles LIMIT 1;
