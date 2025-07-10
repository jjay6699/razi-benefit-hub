import { Company, Employee, Transaction } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Company Storage
export const getCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
  
  return data?.map(company => ({
    id: company.id,
    name: company.name,
    createdAt: company.created_at,
  })) || [];
};

export const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .insert([{ name: company.name }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding company:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  };
};

export const deleteCompany = async (companyId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (error) {
    console.error('Error deleting company:', error);
    return false;
  }

  return true;
};

// Employee Storage
export const getEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
  
  return data?.map(employee => ({
    id: employee.id,
    empId: employee.emp_id,
    name: employee.name,
    companyId: employee.company_id,
    companyName: employee.company_name,
    annualBalance: Number(employee.annual_balance),
    currentBalance: Number(employee.current_balance),
    createdAt: employee.created_at,
  })) || [];
};

export const getEmployeeById = async (employeeId: string): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', employeeId)
    .single();
  
  if (error) {
    console.error('Error fetching employee by ID:', error);
    return null;
  }
  
  return {
    id: data.id,
    empId: data.emp_id,
    name: data.name,
    companyId: data.company_id,
    companyName: data.company_name,
    annualBalance: Number(data.annual_balance),
    currentBalance: Number(data.current_balance),
    createdAt: data.created_at,
  };
};

export const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from('employees')
    .insert([{
      emp_id: employee.empId,
      name: employee.name,
      company_id: employee.companyId,
      company_name: employee.companyName,
      annual_balance: employee.annualBalance,
      current_balance: employee.currentBalance,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding employee:', error);
    return null;
  }
  
  return {
    id: data.id,
    empId: data.emp_id,
    name: data.name,
    companyId: data.company_id,
    companyName: data.company_name,
    annualBalance: Number(data.annual_balance),
    currentBalance: Number(data.current_balance),
    createdAt: data.created_at,
  };
};

export const updateEmployee = async (employeeId: string, updates: Partial<Employee>): Promise<Employee | null> => {
  const updateData: any = {};
  if (updates.empId) updateData.emp_id = updates.empId;
  if (updates.name) updateData.name = updates.name;
  if (updates.companyId) updateData.company_id = updates.companyId;
  if (updates.companyName) updateData.company_name = updates.companyName;
  if (updates.annualBalance !== undefined) updateData.annual_balance = updates.annualBalance;
  if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;
  
  const { data, error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', employeeId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating employee:', error);
    return null;
  }
  
  return {
    id: data.id,
    empId: data.emp_id,
    name: data.name,
    companyId: data.company_id,
    companyName: data.company_name,
    annualBalance: Number(data.annual_balance),
    currentBalance: Number(data.current_balance),
    createdAt: data.created_at,
  };
};

export const searchEmployees = async (query: string): Promise<Employee[]> => {
  const searchTerm = query.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,emp_id.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error searching employees:', error);
    return [];
  }
  
  return data?.map(employee => ({
    id: employee.id,
    empId: employee.emp_id,
    name: employee.name,
    companyId: employee.company_id,
    companyName: employee.company_name,
    annualBalance: Number(employee.annual_balance),
    currentBalance: Number(employee.current_balance),
    createdAt: employee.created_at,
  })) || [];
};

export const deleteEmployee = async (employeeId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', employeeId);
  
  if (error) {
    console.error('Error deleting employee:', error);
    return false;
  }
  
  return true;
};

// Transaction Storage
export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return data?.map(transaction => ({
    id: transaction.id,
    employeeId: transaction.employee_id,
    employeeName: transaction.employee_name,
    employeeEmpId: transaction.employee_emp_id,
    companyName: transaction.company_name,
    amount: Number(transaction.amount),
    description: transaction.description,
    diagnosis: transaction.diagnosis,
    medicalLeaveGranted: transaction.medical_leave_granted || false,
    mcDateFrom: transaction.mc_date_from,
    mcDateTo: transaction.mc_date_to,
    date: transaction.date,
    balanceAfter: Number(transaction.balance_after),
  })) || [];
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      employee_id: transaction.employeeId,
      employee_name: transaction.employeeName,
      employee_emp_id: transaction.employeeEmpId,
      company_name: transaction.companyName,
      amount: transaction.amount,
      description: transaction.description,
      diagnosis: transaction.diagnosis,
      medical_leave_granted: transaction.medicalLeaveGranted,
      mc_date_from: transaction.mcDateFrom,
      mc_date_to: transaction.mcDateTo,
      balance_after: transaction.balanceAfter,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
  
  return {
    id: data.id,
    employeeId: data.employee_id,
    employeeName: data.employee_name,
    employeeEmpId: data.employee_emp_id,
    companyName: data.company_name,
    amount: Number(data.amount),
    description: data.description,
    diagnosis: data.diagnosis,
    medicalLeaveGranted: data.medical_leave_granted || false,
    mcDateFrom: data.mc_date_from,
    mcDateTo: data.mc_date_to,
    date: data.date,
    balanceAfter: Number(data.balance_after),
  };
};

// HR Admin specific functions
export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching employees by company:', error);
    return [];
  }
  
  return data?.map(employee => ({
    id: employee.id,
    empId: employee.emp_id,
    name: employee.name,
    companyId: employee.company_id,
    companyName: employee.company_name,
    annualBalance: Number(employee.annual_balance),
    currentBalance: Number(employee.current_balance),
    createdAt: employee.created_at,
  })) || [];
};

export const getTransactionsByCompany = async (companyId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      employees!inner(company_id)
    `)
    .eq('employees.company_id', companyId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions by company:', error);
    return [];
  }
  
  return data?.map(transaction => ({
    id: transaction.id,
    employeeId: transaction.employee_id,
    employeeName: transaction.employee_name,
    employeeEmpId: transaction.employee_emp_id,
    companyName: transaction.company_name,
    amount: Number(transaction.amount),
    description: transaction.description,
    diagnosis: transaction.diagnosis,
    medicalLeaveGranted: transaction.medical_leave_granted || false,
    mcDateFrom: transaction.mc_date_from,
    mcDateTo: transaction.mc_date_to,
    date: transaction.date,
    balanceAfter: Number(transaction.balance_after),
  })) || [];
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();
  
  if (error) {
    console.error('Error fetching company by ID:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
  };
};

export const getEmployeeTransactions = async (employeeId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching employee transactions:', error);
    return [];
  }
  
  return data?.map(transaction => ({
    id: transaction.id,
    employeeId: transaction.employee_id,
    employeeName: transaction.employee_name,
    employeeEmpId: transaction.employee_emp_id,
    companyName: transaction.company_name,
    amount: Number(transaction.amount),
    description: transaction.description,
    diagnosis: transaction.diagnosis,
    medicalLeaveGranted: transaction.medical_leave_granted || false,
    mcDateFrom: transaction.mc_date_from,
    mcDateTo: transaction.mc_date_to,
    date: transaction.date,
    balanceAfter: Number(transaction.balance_after),
  })) || [];
};