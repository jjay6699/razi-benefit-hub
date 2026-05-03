import { Company, Employee, Transaction } from '@/types';
import { api } from '@/integrations/api/client';

interface ProfileWithCompany {
  id: string;
  user_id: string;
  full_name: string;
  ic_number: string | null;
  phone_number: string | null;
  role: 'admin' | 'patient' | 'hr_admin';
  company_id: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export const getAllProfiles = async (): Promise<ProfileWithCompany[]> => {
  return api.profiles.getAll();
};

export const updateUserProfile = async (userId: string, updates: any) => {
  return api.profiles.update(userId, updates);
};

export const getCompanies = async (): Promise<Company[]> => {
  const companies = await api.companies.getAll();
  return companies.map((c: any) => ({
    id: c.id,
    name: c.name,
    createdAt: c.created_at,
  }));
};

export const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>): Promise<Company | null> => {
  try {
    const result = await api.companies.create(company.name);
    return {
      id: result.id,
      name: result.name,
      createdAt: result.created_at,
    };
  } catch {
    return null;
  }
};

export const deleteCompany = async (companyId: string): Promise<boolean> => {
  try {
    await api.companies.delete(companyId);
    return true;
  } catch {
    return false;
  }
};

export const getEmployees = async (): Promise<Employee[]> => {
  const employees = await api.employees.getAll();
  return employees.map((e: any) => ({
    id: e.id,
    empId: e.emp_id,
    name: e.name,
    companyId: e.company_id,
    companyName: e.company_name,
    annualBalance: e.annual_balance,
    currentBalance: e.current_balance,
    createdAt: e.created_at,
  }));
};

export const getEmployeeById = async (employeeId: string): Promise<Employee | null> => {
  try {
    const e = await api.employees.getById(employeeId);
    return {
      id: e.id,
      empId: e.emp_id,
      name: e.name,
      companyId: e.company_id,
      companyName: e.company_name,
      annualBalance: e.annual_balance,
      currentBalance: e.current_balance,
      createdAt: e.created_at,
    };
  } catch {
    return null;
  }
};

export const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee | null> => {
  try {
    const result = await api.employees.create({
      emp_id: employee.empId,
      name: employee.name,
      company_id: employee.companyId,
      company_name: employee.companyName,
      annual_balance: employee.annualBalance,
      current_balance: employee.currentBalance,
    });
    return {
      id: result.id,
      empId: result.emp_id,
      name: result.name,
      companyId: result.company_id,
      companyName: result.company_name,
      annualBalance: result.annual_balance,
      currentBalance: result.current_balance,
      createdAt: result.created_at,
    };
  } catch {
    return null;
  }
};

export const updateEmployee = async (employeeId: string, updates: Partial<Employee>): Promise<Employee | null> => {
  try {
    const updateData: any = {};
    if (updates.empId) updateData.emp_id = updates.empId;
    if (updates.name) updateData.name = updates.name;
    if (updates.companyId) updateData.company_id = updates.companyId;
    if (updates.companyName) updateData.company_name = updates.companyName;
    if (updates.annualBalance !== undefined) updateData.annual_balance = updates.annualBalance;
    if (updates.currentBalance !== undefined) updateData.current_balance = updates.currentBalance;

    const result = await api.employees.update(employeeId, updateData);
    return {
      id: result.id,
      empId: result.emp_id,
      name: result.name,
      companyId: result.company_id,
      companyName: result.company_name,
      annualBalance: result.annual_balance,
      currentBalance: result.current_balance,
      createdAt: result.created_at,
    };
  } catch {
    return null;
  }
};

export const searchEmployees = async (query: string): Promise<Employee[]> => {
  try {
    const employees = await api.employees.search(query);
    return employees.map((e: any) => ({
      id: e.id,
      empId: e.emp_id,
      name: e.name,
      companyId: e.company_id,
      companyName: e.company_name,
      annualBalance: e.annual_balance,
      currentBalance: e.current_balance,
      createdAt: e.created_at,
    }));
  } catch {
    return [];
  }
};

export const deleteEmployee = async (employeeId: string): Promise<boolean> => {
  try {
    await api.employees.delete(employeeId);
    return true;
  } catch {
    return false;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const transactions = await api.transactions.getAll();
  return transactions.map((t: any) => ({
    id: t.id,
    employeeId: t.employee_id,
    employeeName: t.employee_name,
    employeeEmpId: t.employee_emp_id,
    companyName: t.company_name,
    amount: t.amount,
    description: t.description,
    diagnosis: t.diagnosis,
    medicalLeaveGranted: t.medical_leave_granted ? true : false,
    mcDateFrom: t.mc_date_from,
    mcDateTo: t.mc_date_to,
    date: t.date,
    balanceAfter: t.balance_after,
  }));
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction | null> => {
  try {
    const result = await api.transactions.create({
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
    });
    return {
      id: result.id,
      employeeId: result.employee_id,
      employeeName: result.employee_name,
      employeeEmpId: result.employee_emp_id,
      companyName: result.company_name,
      amount: result.amount,
      description: result.description,
      diagnosis: result.diagnosis,
      medicalLeaveGranted: result.medical_leave_granted ? true : false,
      mcDateFrom: result.mc_date_from,
      mcDateTo: result.mc_date_to,
      date: result.date,
      balanceAfter: result.balance_after,
    };
  } catch {
    return null;
  }
};

export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  try {
    const employees = await api.employees.getByCompany(companyId);
    return employees.map((e: any) => ({
      id: e.id,
      empId: e.emp_id,
      name: e.name,
      companyId: e.company_id,
      companyName: e.company_name,
      annualBalance: e.annual_balance,
      currentBalance: e.current_balance,
      createdAt: e.created_at,
    }));
  } catch {
    return [];
  }
};

export const getTransactionsByCompany = async (companyId: string): Promise<Transaction[]> => {
  try {
    const transactions = await api.transactions.getByCompany(companyId);
    return transactions.map((t: any) => ({
      id: t.id,
      employeeId: t.employee_id,
      employeeName: t.employee_name,
      employeeEmpId: t.employee_emp_id,
      companyName: t.company_name,
      amount: t.amount,
      description: t.description,
      diagnosis: t.diagnosis,
      medicalLeaveGranted: t.medical_leave_granted ? true : false,
      mcDateFrom: t.mc_date_from,
      mcDateTo: t.mc_date_to,
      date: t.date,
      balanceAfter: t.balance_after,
    }));
  } catch {
    return [];
  }
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  try {
    const c = await api.companies.getById(companyId);
    return {
      id: c.id,
      name: c.name,
      createdAt: c.created_at,
    };
  } catch {
    return null;
  }
};

export const getEmployeeTransactions = async (employeeId: string): Promise<Transaction[]> => {
  try {
    const transactions = await api.transactions.getByEmployee(employeeId);
    return transactions.map((t: any) => ({
      id: t.id,
      employeeId: t.employee_id,
      employeeName: t.employee_name,
      employeeEmpId: t.employee_emp_id,
      companyName: t.company_name,
      amount: t.amount,
      description: t.description,
      diagnosis: t.diagnosis,
      medicalLeaveGranted: t.medical_leave_granted ? true : false,
      mcDateFrom: t.mc_date_from,
      mcDateTo: t.mc_date_to,
      date: t.date,
      balanceAfter: t.balance_after,
    }));
  } catch {
    return [];
  }
};