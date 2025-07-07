-- Update the admin user's role from patient to admin  
UPDATE public.profiles 
SET role = 'admin'::user_role
WHERE user_id = '75d3758b-a9d3-4ba7-b8d6-4ca86e911e20';

-- Verify the update
SELECT p.user_id, p.role, p.full_name, u.email 
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id 
WHERE u.email = 'admin1214@admin.com';