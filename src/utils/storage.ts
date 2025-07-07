import { Company, Employee, Transaction } from '@/types';

const STORAGE_KEYS = {
  COMPANIES: 'razi_companies',
  EMPLOYEES: 'razi_employees',
  TRANSACTIONS: 'razi_transactions',
};

// Company Storage
export const getCompanies = (): Company[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  return stored ? JSON.parse(stored) : [];
};

export const saveCompanies = (companies: Company[]): void => {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
};

export const addCompany = (company: Omit<Company, 'id' | 'createdAt'>): Company => {
  const companies = getCompanies();
  const newCompany: Company = {
    ...company,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  companies.push(newCompany);
  saveCompanies(companies);
  return newCompany;
};

// Employee Storage
export const getEmployees = (): Employee[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  return stored ? JSON.parse(stored) : [];
};

export const saveEmployees = (employees: Employee[]): void => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

export const addEmployee = (employee: Omit<Employee, 'id' | 'createdAt'>): Employee => {
  const employees = getEmployees();
  const newEmployee: Employee = {
    ...employee,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
};

export const updateEmployee = (employeeId: string, updates: Partial<Employee>): Employee | null => {
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === employeeId);
  if (index === -1) return null;
  
  employees[index] = { ...employees[index], ...updates };
  saveEmployees(employees);
  return employees[index];
};

export const searchEmployees = (query: string): Employee[] => {
  const employees = getEmployees();
  const searchTerm = query.toLowerCase().trim();
  
  return employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm) ||
    employee.empId.toLowerCase().includes(searchTerm)
  );
};

// Transaction Storage
export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>): Transaction => {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
};

export const getEmployeeTransactions = (employeeId: string): Transaction[] => {
  const transactions = getTransactions();
  return transactions
    .filter(transaction => transaction.employeeId === employeeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};