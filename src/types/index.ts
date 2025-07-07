export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  empId: string;
  name: string;
  companyId: string;
  companyName: string;
  annualBalance: number;
  currentBalance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmpId: string;
  companyName: string;
  amount: number;
  description: string;
  date: string;
  balanceAfter: number;
}

export interface UploadResult {
  success: number;
  errors: string[];
  duplicates: string[];
}