import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getEmployees, getTransactions, getCompanies } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalEmployees: number;
  totalCompanies: number;
  totalTransactions: number;
  totalAmountUsed: number;
  totalBalance: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalCompanies: 0,
    totalTransactions: 0,
    totalAmountUsed: 0,
    totalBalance: 0,
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

      setStats({
        totalEmployees: employees.length,
        totalCompanies: companies.length,
        totalTransactions: transactions.length,
        totalAmountUsed,
        totalBalance,
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
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Medical Benefit Dashboard</h1>
        <p className="text-primary-foreground/90">
          Manage your medical benefits system efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <span className="text-2xl">💳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {stats.totalBalance.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full" size="lg">
              <Link to="/dashboard/staff">🔍 Search Employee</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/dashboard/admin">⚙️ Admin Panel</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/dashboard/companies">🏢 Manage Companies</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Used:</span>
                <span className="font-medium">RM {stats.totalAmountUsed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Balance:</span>
                <span className="font-medium text-success">RM {stats.totalBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Employees:</span>
                <span className="font-medium">{stats.totalEmployees}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-4">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Start by adding employees or processing transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};