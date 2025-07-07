import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getEmployees, getCompanies, getTransactions } from '@/utils/storage';
import { Employee, Company, Transaction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Building, CreditCard, Download, Calendar, Filter } from 'lucide-react';

export const Reports = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, dateFrom, dateTo, selectedCompany]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesData, companiesData, transactionsData] = await Promise.all([
        getEmployees(),
        getCompanies(),
        getTransactions()
      ]);
      
      setEmployees(employeesData);
      setCompanies(companiesData);
      setTransactions(transactionsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(dateTo));
    }
    if (selectedCompany !== 'all') {
      filtered = filtered.filter(t => t.companyName === selectedCompany);
    }

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCompany('all');
  };

  // Calculate statistics
  const totalEmployees = employees.length;
  const totalCompanies = companies.length;
  const totalTransactions = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const activeEmployees = employees.filter(e => e.currentBalance > 0).length;
  const averageBalance = employees.length > 0 ? employees.reduce((sum, e) => sum + e.currentBalance, 0) / employees.length : 0;

  // Company spending data for chart
  const companySpending = companies.map(company => {
    const companyTransactions = filteredTransactions.filter(t => t.companyName === company.name);
    const totalSpent = companyTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      name: company.name,
      amount: totalSpent,
      transactions: companyTransactions.length
    };
  }).sort((a, b) => b.amount - a.amount);

  // Monthly transaction data
  const monthlyData = filteredTransactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, amount: 0, count: 0 };
    }
    acc[month].amount += transaction.amount;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { month: string; amount: number; count: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Status distribution for pie chart
  const statusData = [
    { name: 'Active', value: activeEmployees, color: '#8884d8' },
    { name: 'Depleted', value: totalEmployees - activeEmployees, color: '#82ca9d' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-primary-foreground/90">System usage and financial reports</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-primary-foreground/90">System usage and financial reports</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company-filter">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Registered companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Medical claims processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM {totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Claims processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Transaction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'amount' ? `RM ${value.toFixed(2)}` : value,
                    name === 'amount' ? 'Amount' : 'Transactions'
                  ]}
                />
                <Bar dataKey="amount" fill="#8884d8" name="amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Company Spending Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Spending Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Average per Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companySpending.map((company) => (
                <TableRow key={company.name}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>RM {company.amount.toFixed(2)}</TableCell>
                  <TableCell>{company.transactions}</TableCell>
                  <TableCell>
                    RM {company.transactions > 0 ? (company.amount / company.transactions).toFixed(2) : '0.00'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>MC Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.employeeName}</TableCell>
                  <TableCell>{transaction.companyName}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>RM {transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.medicalLeaveGranted ? "default" : "secondary"}>
                      {transaction.medicalLeaveGranted ? "Granted" : "Not Granted"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredTransactions.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing 10 of {filteredTransactions.length} transactions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};