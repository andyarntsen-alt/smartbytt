-- Add INSERT policy for profiles table
-- This allows users to create their own profile if it doesn't exist
-- (e.g., if they signed up before the trigger was created)

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Done!
SELECT 'Added profiles INSERT policy!' as status;
