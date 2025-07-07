-- Fix search_path security warnings for all functions

-- Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the create_admin_profile function
CREATE OR REPLACE FUNCTION public.create_admin_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert admin profile for the specific admin email
  INSERT INTO public.profiles (user_id, role, full_name, ic_number, phone_number)
  SELECT 
    id, 
    'admin'::public.user_role, 
    'System Administrator', 
    'ADMIN001', 
    '+60123456789'
  FROM auth.users 
  WHERE email = 'admin1214@admin.com'
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin'::public.user_role,
    full_name = 'System Administrator';
END;
$$;

-- Update the create_initial_admin_user function
CREATE OR REPLACE FUNCTION public.create_initial_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- This function should be called after the admin user signs up through the UI
  -- It will set their role to admin and update their profile
  UPDATE public.profiles 
  SET 
    role = 'admin'::public.user_role,
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
    'admin'::public.user_role, 
    'System Administrator', 
    'ADMIN001', 
    '+60123456789'
  FROM auth.users 
  WHERE email = 'admin1214@admin.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
  );
END;
$$;

-- Update the get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'patient'::public.user_role;
END;
$$;