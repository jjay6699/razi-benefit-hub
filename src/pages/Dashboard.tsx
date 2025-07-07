import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmployees, getTransactions, getCompanies } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Transaction } from '@/types';

interface DashboardStats {
  totalEmployees: number;
  totalCompanies: number;
  totalTransactions: number;
  totalAmountUsed: number;
  totalBalance: number;
  medicalLeavesGranted: number;
  medicalLeavePercentage: number;
  recentTransactions: Transaction[];
  topCompanies: { name: string; employeeCount: number }[];
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalCompanies: 0,
    totalTransactions: 0,
    totalAmountUsed: 0,
    totalBalance: 0,
    medicalLeavesGranted: 0,
    medicalLeavePercentage: 0,
    recentTransactions: [],
    topCompanies: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [employees, transactions, companies] = await Promise.all([
        getEmployees(),
        getTransactions(),
        getCompanies()
      ]);

      const totalAmountUsed = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const totalBalance = employees.reduce((sum, employee) => sum + employee.currentBalance, 0);
      
      // Calculate medical leave statistics
      const medicalLeavesGranted = transactions.filter(t => t.medicalLeaveGranted).length;
      const medicalLeavePercentage = transactions.length > 0 ? (medicalLeavesGranted / transactions.length) * 100 : 0;
      
      // Get recent transactions (last 5)
      const recentTransactions = transactions.slice(0, 5);
      
      // Calculate top companies by employee count
      const companyEmployeeCounts = companies.map(company => ({
        name: company.name,
        employeeCount: employees.filter(emp => emp.companyId === company.id).length
      })).sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 3);

      setStats({
        totalEmployees: employees.length,
        totalCompanies: companies.length,
        totalTransactions: transactions.length,
        totalAmountUsed,
        totalBalance,
        medicalLeavesGranted,
        medicalLeavePercentage,
        recentTransactions,
        topCompanies: companyEmployeeCounts,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-2">Medical Benefit Dashboard</h1>
          <p className="text-primary-foreground/90">Loading system data...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Medical Benefit Dashboard</h1>
        <p className="text-primary-foreground/90 text-sm sm:text-base">
          Manage your medical benefits system efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Employees</CardTitle>
            <span className="text-xl sm:text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Companies</CardTitle>
            <span className="text-xl sm:text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Transactions</CardTitle>
            <span className="text-xl sm:text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Medical Leaves</CardTitle>
            <span className="text-xl sm:text-2xl">🏥</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.medicalLeavesGranted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.medicalLeavePercentage.toFixed(1)}% of transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Button asChild className="w-full" size="sm">
              <Link to="/dashboard/staff">🔍 Search Employee</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/dashboard/admin">⚙️ Admin Panel</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/dashboard/companies">🏢 Manage Companies</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Amount Used:</span>
                <span className="font-medium text-sm">RM {stats.totalAmountUsed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Remaining Balance:</span>
                <span className="font-medium text-success text-sm">RM {stats.totalBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Active Employees:</span>
                <span className="font-medium text-sm">{stats.totalEmployees}</span>
              </div>
              {stats.topCompanies.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Top Companies</p>
                  {stats.topCompanies.slice(0, 2).map(company => (
                    <div key={company.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{company.name}:</span>
                      <span className="font-medium">{company.employeeCount} employees</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {stats.recentTransactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0">
                    <div>
                      <p className="font-medium">{transaction.employeeName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">RM {transaction.amount.toFixed(2)}</p>
                      {transaction.medicalLeaveGranted && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">ML</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <p className="text-sm">No recent transactions</p>
                <p className="text-xs mt-2">Start by processing medical claims</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};