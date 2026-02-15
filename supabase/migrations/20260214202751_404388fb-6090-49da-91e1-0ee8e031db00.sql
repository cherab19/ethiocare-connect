
-- Fix the overly permissive profiles insert policy
-- The trigger runs as SECURITY DEFINER so it bypasses RLS. 
-- We can restrict the insert policy to only allow users to insert their own profile.
DROP POLICY "System inserts profiles" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
