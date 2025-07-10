import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeesByCompany, getTransactionsByCompany, getCompanyById } from '@/utils/storage';
import { Employee, Transaction, Company } from '@/types';
import { Users, Activity, DollarSign } from 'lucide-react';

export const HRAdminDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.company_id) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile?.company_id) return;

    setLoading(true);
    try {
      const [employeesData, transactionsData, companyData] = await Promise.all([
        getEmployeesByCompany(profile.company_id),
        getTransactionsByCompany(profile.company_id),
        getCompanyById(profile.company_id)
      ]);

      setEmployees(employeesData);
      setTransactions(transactionsData);
      setCompany(companyData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalBalance = employees.reduce((sum, emp) => sum + emp.currentBalance, 0);
  const totalAnnualBalance = employees.reduce((sum, emp) => sum + emp.annualBalance, 0);
  const totalSpent = transactions.reduce((sum, trans) => sum + trans.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{company?.name || 'Company Dashboard'}</h1>
        <p className="text-primary-foreground/90 text-sm sm:text-base">
          HR Admin Dashboard - View only access to company data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Employees</CardTitle>
            <span className="text-xl sm:text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Current Balance</CardTitle>
            <span className="text-xl sm:text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">RM {totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Annual Balance</CardTitle>
            <span className="text-xl sm:text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">RM {totalAnnualBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
            <span className="text-xl sm:text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">RM {totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Company Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No employees found</p>
            ) : (
              <div className="grid gap-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/hr-admin/employee/${employee.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{employee.name}</h3>
                          <p className="text-sm text-muted-foreground">ID: {employee.empId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Current Balance</div>
                        <div className="font-medium">RM {employee.currentBalance.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Annual Balance</div>
                        <div className="font-medium">RM {employee.annualBalance.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions found</p>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium">{transaction.employeeName}</h3>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          {transaction.diagnosis && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Diagnosis: {transaction.diagnosis}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-destructive">-RM {transaction.amount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {transaction.medicalLeaveGranted && (
                          <Badge variant="secondary">
                            MC Granted
                          </Badge>
                        )}
                        {transaction.medicalLeaveGranted && transaction.mcDateFrom && transaction.mcDateTo && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.mcDateFrom).toLocaleDateString('en-GB')} - {new Date(transaction.mcDateTo).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};