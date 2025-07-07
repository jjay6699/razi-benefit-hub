-- Add diagnosis and medical leave fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN diagnosis TEXT,
ADD COLUMN medical_leave_granted BOOLEAN DEFAULT false;