-- Add hr_admin to the user_role enum (needs to be in separate transaction)
ALTER TYPE public.user_role ADD VALUE 'hr_admin';