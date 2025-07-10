import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeesByCompany, getTransactionsByCompany, getCompanyById } from '@/utils/storage';
import { Employee, Transaction, Company } from '@/types';
import { Building2, Users, Activity, DollarSign } from 'lucide-react';

export const HRAdminDashboard = () => {
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
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-8 w-8" />
          <h1 className="text-3xl font-bold">{company?.name || 'Company Dashboard'}</h1>
        </div>
        <p className="text-primary-foreground/90">
          HR Admin Dashboard - View only access to company data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalAnnualBalance.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Employees List */}
      <Card>
        <CardHeader>
          <CardTitle>Company Employees</CardTitle>
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
                    className="flex items-center justify-between p-4 border rounded-lg"
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
          <CardTitle>Recent Transactions</CardTitle>
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
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      {transaction.medicalLeaveGranted && (
                        <Badge variant="secondary">
                          MC Granted
                        </Badge>
                      )}
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