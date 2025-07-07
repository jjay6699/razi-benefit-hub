-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  emp_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  annual_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  employee_emp_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  balance_after DECIMAL(10,2) NOT NULL
);

-- Enable Row Level Security (but make policies very permissive since admin manages everything)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (no auth needed since admin manages everything)
CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_employees_emp_id ON public.employees(emp_id);
CREATE INDEX idx_employees_company_id ON public.employees(company_id);
CREATE INDEX idx_transactions_employee_id ON public.transactions(employee_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);