-- Add hr_admin to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'hr_admin';

-- Add company_id to profiles table for HR admins
ALTER TABLE public.profiles 
ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Update RLS policies for profiles to allow admins to manage HR admins
DROP POLICY IF EXISTS "Admins can insert HR admin profiles" ON public.profiles;
CREATE POLICY "Admins can insert HR admin profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  get_current_user_role() = 'admin'::user_role OR 
  auth.uid() = user_id
);

-- Allow admins to update HR admin profiles
DROP POLICY IF EXISTS "Admins can update HR admin profiles" ON public.profiles;
CREATE POLICY "Admins can update HR admin profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  get_current_user_role() = 'admin'::user_role OR 
  auth.uid() = user_id
);

-- HR admins can view employees from their assigned company
DROP POLICY IF EXISTS "HR admins can view their company employees" ON public.employees;
CREATE POLICY "HR admins can view their company employees" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (
  true OR -- Keep existing open policy
  (
    get_current_user_role() = 'hr_admin'::user_role AND 
    company_id IN (
      SELECT p.company_id 
      FROM public.profiles p 
      WHERE p.user_id = auth.uid() AND p.company_id IS NOT NULL
    )
  )
);

-- HR admins can view transactions from their assigned company employees
DROP POLICY IF EXISTS "HR admins can view their company transactions" ON public.transactions;
CREATE POLICY "HR admins can view their company transactions" 
ON public.transactions 
FOR SELECT 
TO authenticated
USING (
  true OR -- Keep existing open policy
  (
    get_current_user_role() = 'hr_admin'::user_role AND 
    employee_id IN (
      SELECT e.id 
      FROM public.employees e
      INNER JOIN public.profiles p ON p.user_id = auth.uid()
      WHERE e.company_id = p.company_id AND p.company_id IS NOT NULL
    )
  )
);