-- Create the admin user in auth.users and then create their profile
-- First, we need to create the admin user in the auth system
-- Since we can't directly insert into auth.users in SQL, we'll create a function to do it

-- Create admin user with specific credentials
-- Note: In production, this should be done through Supabase Auth UI or signup flow
-- This is a workaround to create the initial admin user

-- First, let's ensure we can call the existing create_admin_profile function
-- We need to create the user first through the application

-- Alternative approach: Create a function that can be called after the admin signs up
CREATE OR REPLACE FUNCTION create_initial_admin_user()
RETURNS void AS $$
BEGIN
  -- This function should be called after the admin user signs up through the UI
  -- It will set their role to admin and update their profile
  UPDATE public.profiles 
  SET 
    role = 'admin'::user_role,
    full_name = 'System Administrator',
    ic_number = 'ADMIN001',
    phone_number = '+60123456789'
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin1214@admin.com'
  );
  
  -- If no profile exists, create one
  INSERT INTO public.profiles (user_id, role, full_name, ic_number, phone_number)
  SELECT 
    id, 
    'admin'::user_role, 
    'System Administrator', 
    'ADMIN001', 
    '+60123456789'
  FROM auth.users 
  WHERE email = 'admin1214@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;