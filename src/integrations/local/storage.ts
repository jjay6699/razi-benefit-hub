import { initDatabase, saveDatabase, generateId, Company, Employee, Transaction } from './database';

export const getAllProfiles = async () => {
  const db = await initDatabase();
  const result = db.exec(`
    SELECT p.*, c.name as company_name 
    FROM profiles p 
    LEFT JOIN companies c ON p.company_id = c.id 
    ORDER BY p.created_at ASC
  `);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0],
    user_id: row[1],
    full_name: row[2],
    ic_number: row[3],
    phone_number: row[4],
    role: row[5],
    company_id: row[6],
    company_name: row[9],
    created_at: row[7],
    updated_at: row[8],
  }));
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const db = await initDatabase();
  const now = new Date().toISOString();
  
  db.run(`
    UPDATE profiles 
    SET full_name = COALESCE(?, full_name),
        company_id = COALESCE(?, company_id),
        role = COALESCE(?, role),
        updated_at = ?
    WHERE user_id = ?
  `, [updates.full_name, updates.company_id, updates.role, now, userId]);
  
  saveDatabase();
  return { error: null };
};

export const getCompanies = async (): Promise<Company[]> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM companies ORDER BY created_at ASC`);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    name: row[1] as string,
    created_at: row[2] as string,
  }));
};

export const addCompany = async (company: Omit<Company, 'id' | 'createdAt'>): Promise<Company | null> => {
  const db = await initDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  db.run(`INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)`, [id, company.name, now]);
  saveDatabase();
  
  return { id, name: company.name, created_at: now };
};

export const deleteCompany = async (companyId: string): Promise<boolean> => {
  const db = await initDatabase();
  db.run(`DELETE FROM companies WHERE id = ?`, [companyId]);
  saveDatabase();
  return true;
};

export const getEmployees = async (): Promise<Employee[]> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM employees ORDER BY created_at ASC`);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    emp_id: row[1] as string,
    name: row[2] as string,
    company_id: row[3] as string,
    company_name: row[4] as string,
    annual_balance: row[5] as number,
    current_balance: row[6] as number,
    created_at: row[7] as string,
  }));
};

export const getEmployeeById = async (employeeId: string): Promise<Employee | null> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM employees WHERE id = ?`, [employeeId]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  return {
    id: row[0] as string,
    emp_id: row[1] as string,
    name: row[2] as string,
    company_id: row[3] as string,
    company_name: row[4] as string,
    annual_balance: row[5] as number,
    current_balance: row[6] as number,
    created_at: row[7] as string,
  };
};

export const addEmployee = async (employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee | null> => {
  const db = await initDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO employees (id, emp_id, name, company_id, company_name, annual_balance, current_balance, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, employee.emp_id, employee.name, employee.company_id, employee.company_name, employee.annualBalance, employee.currentBalance, now]);
  
  saveDatabase();
  
  return {
    id,
    emp_id: employee.emp_id,
    name: employee.name,
    company_id: employee.company_id,
    company_name: employee.company_name,
    annual_balance: employee.annualBalance,
    current_balance: employee.currentBalance,
    created_at: now,
  };
};

export const updateEmployee = async (employeeId: string, updates: Partial<Employee>): Promise<Employee | null> => {
  const db = await initDatabase();
  
  const current = await getEmployeeById(employeeId);
  if (!current) return null;
  
  db.run(`
    UPDATE employees SET
      emp_id = COALESCE(?, emp_id),
      name = COALESCE(?, name),
      company_id = COALESCE(?, company_id),
      company_name = COALESCE(?, company_name),
      annual_balance = COALESCE(?, annual_balance),
      current_balance = COALESCE(?, current_balance)
    WHERE id = ?
  `, [
    updates.empId ?? null,
    updates.name ?? null,
    updates.companyId ?? null,
    updates.companyName ?? null,
    updates.annualBalance ?? null,
    updates.currentBalance ?? null,
    employeeId
  ]);
  
  saveDatabase();
  return getEmployeeById(employeeId);
};

export const searchEmployees = async (query: string): Promise<Employee[]> => {
  const db = await initDatabase();
  const searchTerm = `%${query.toLowerCase()}%`;
  const result = db.exec(`
    SELECT * FROM employees 
    WHERE LOWER(name) LIKE ? OR LOWER(emp_id) LIKE ?
    ORDER BY created_at ASC
  `, [searchTerm, searchTerm]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    emp_id: row[1] as string,
    name: row[2] as string,
    company_id: row[3] as string,
    company_name: row[4] as string,
    annual_balance: row[5] as number,
    current_balance: row[6] as number,
    created_at: row[7] as string,
  }));
};

export const deleteEmployee = async (employeeId: string): Promise<boolean> => {
  const db = await initDatabase();
  db.run(`DELETE FROM employees WHERE id = ?`, [employeeId]);
  saveDatabase();
  return true;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM transactions ORDER BY date DESC`);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    employee_id: row[1] as string,
    employee_name: row[2] as string,
    employee_emp_id: row[3] as string,
    company_name: row[4] as string,
    amount: row[5] as number,
    description: row[6] as string,
    diagnosis: row[7] as string | null,
    medical_leave_granted: row[8] ? Boolean(row[8]) : null,
    mc_date_from: row[9] as string | null,
    mc_date_to: row[10] as string | null,
    date: row[11] as string,
    balance_after: row[12] as number,
  }));
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction | null> => {
  const db = await initDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO transactions (id, employee_id, employee_name, employee_emp_id, company_name, amount, description, diagnosis, medical_leave_granted, mc_date_from, mc_date_to, date, balance_after)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    transaction.employee_id,
    transaction.employee_name,
    transaction.employee_emp_id,
    transaction.company_name,
    transaction.amount,
    transaction.description,
    transaction.diagnosis,
    transaction.medical_leave_granted ? 1 : 0,
    transaction.mc_date_from,
    transaction.mc_date_to,
    now,
    transaction.balance_after
  ]);
  
  saveDatabase();
  
  return {
    id,
    ...transaction,
    date: now,
  };
};

export const getEmployeesByCompany = async (companyId: string): Promise<Employee[]> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM employees WHERE company_id = ? ORDER BY created_at ASC`, [companyId]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    emp_id: row[1] as string,
    name: row[2] as string,
    company_id: row[3] as string,
    company_name: row[4] as string,
    annual_balance: row[5] as number,
    current_balance: row[6] as number,
    created_at: row[7] as string,
  }));
};

export const getTransactionsByCompany = async (companyId: string): Promise<Transaction[]> => {
  const db = await initDatabase();
  const result = db.exec(`
    SELECT t.* FROM transactions t
    JOIN employees e ON t.employee_id = e.id
    WHERE e.company_id = ?
    ORDER BY t.date DESC
  `, [companyId]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    employee_id: row[1] as string,
    employee_name: row[2] as string,
    employee_emp_id: row[3] as string,
    company_name: row[4] as string,
    amount: row[5] as number,
    description: row[6] as string,
    diagnosis: row[7] as string | null,
    medical_leave_granted: row[8] ? Boolean(row[8]) : null,
    mc_date_from: row[9] as string | null,
    mc_date_to: row[10] as string | null,
    date: row[11] as string,
    balance_after: row[12] as number,
  }));
};

export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM companies WHERE id = ?`, [companyId]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  return {
    id: row[0] as string,
    name: row[1] as string,
    created_at: row[2] as string,
  };
};

export const getEmployeeTransactions = async (employeeId: string): Promise<Transaction[]> => {
  const db = await initDatabase();
  const result = db.exec(`SELECT * FROM transactions WHERE employee_id = ? ORDER BY date DESC`, [employeeId]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    employee_id: row[1] as string,
    employee_name: row[2] as string,
    employee_emp_id: row[3] as string,
    company_name: row[4] as string,
    amount: row[5] as number,
    description: row[6] as string,
    diagnosis: row[7] as string | null,
    medical_leave_granted: row[8] ? Boolean(row[8]) : null,
    mc_date_from: row[9] as string | null,
    mc_date_to: row[10] as string | null,
    date: row[11] as string,
    balance_after: row[12] as number,
  }));
};