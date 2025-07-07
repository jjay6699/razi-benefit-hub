-- Create the admin user account
-- This will need to be done manually via Supabase Auth UI or signup
-- But we prepare the profile setup

-- Create a function to handle admin setup after signup
CREATE OR REPLACE FUNCTION create_admin_profile()
RETURNS void AS $$
BEGIN
  -- Insert admin profile for the specific admin email
  INSERT INTO public.profiles (user_id, role, full_name, ic_number, phone_number)
  SELECT 
    id, 
    'admin'::user_role, 
    'System Administrator', 
    'ADMIN001', 
    '+60123456789'
  FROM auth.users 
  WHERE email = 'admin1214@admin.com'
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    full_name = 'System Administrator';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;