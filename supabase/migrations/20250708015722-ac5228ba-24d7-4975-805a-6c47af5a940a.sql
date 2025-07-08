-- Add MC date fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN mc_date_from DATE,
ADD COLUMN mc_date_to DATE;