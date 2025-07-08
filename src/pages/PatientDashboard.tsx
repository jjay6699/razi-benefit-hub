import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getEmployees, getEmployeeTransactions } from '@/utils/storage';
import { Employee, Transaction } from '@/types';
import { User, CreditCard, History, LogOut, AlertCircle } from 'lucide-react';
import { PatientHeader } from '@/components/layout/PatientHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { formatDate, formatDateRange } from '@/utils/dateUtils';

export const PatientDashboard = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile && profile.ic_number) {
      loadPatientData();
    } else if (profile && !profile.ic_number) {
      // Profile exists but no IC number, set loading to false
      setLoading(false);
    }
  }, [user?.id, profile?.id, profile?.ic_number]); // Only re-run when essential IDs change

  const loadPatientData = async () => {
    if (!profile?.ic_number) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Find employee record by IC number
      const employees = await getEmployees();
      const foundEmployee = employees.find(emp => 
        emp.empId === profile.ic_number || 
        emp.name.toLowerCase() === profile.full_name.toLowerCase()
      );

      if (foundEmployee) {
        setEmployee(foundEmployee);
        await loadTransactions(foundEmployee.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your medical benefit data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (employeeId: string) => {
    setLoadingTransactions(true);
    try {
      const transactionData = await getEmployeeTransactions(employeeId);
      setTransactions(transactionData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <PatientHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading your data...</p>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PatientHeader />
      
      <main className="flex-1">
        <div className="container mx-auto max-w-[1300px] px-3 sm:px-4 py-4 sm:py-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 sm:p-6 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-primary-foreground/90 text-sm sm:text-base">Your Medical Benefit Portal</p>
        </div>

        <div className="space-y-4">
          {!employee ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold mb-2">Employee Record Not Found</h2>
                <p className="text-muted-foreground mb-4 text-sm">
                  We couldn't find your employee record in our system. Please contact your HR department or system administrator.
                </p>
                <div className="bg-muted rounded-lg p-4 text-left max-w-md mx-auto">
                  <h3 className="font-medium mb-2 text-sm">Your Profile Information:</h3>
                  <div className="space-y-1 text-xs">
                    <p><strong>Name:</strong> {profile?.full_name}</p>
                    <p><strong>IC Number:</strong> {profile?.ic_number}</p>
                    <p><strong>Phone:</strong> {profile?.phone_number}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Profile Information */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                      <p className="font-medium">{profile?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">IC Number</p>
                      <p className="font-medium">{profile?.ic_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employee ID</p>
                      <p className="font-medium">{employee.empId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Company</p>
                      <p className="font-medium">{employee.companyName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Annual Balance</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      RM {employee.annualBalance.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total allocated for the year
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      RM {employee.currentBalance.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"} className="text-xs">
                        {employee.currentBalance > 0 ? "Active" : "Depleted"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available for medical claims
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5" />
                    Transaction History ({transactions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTransactions ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.date)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                RM {transaction.amount.toFixed(2)}
                              </p>
                              <div className="space-y-1">
                                <Badge variant={transaction.medicalLeaveGranted ? "default" : "secondary"} className="text-xs">
                                  {transaction.medicalLeaveGranted ? "MC Granted" : "No MC"}
                                </Badge>
                                {transaction.medicalLeaveGranted && transaction.mcDateFrom && transaction.mcDateTo && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatDateRange(transaction.mcDateFrom, transaction.mcDateTo)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {transaction.diagnosis && (
                            <div>
                              <p className="text-sm text-muted-foreground">Diagnosis:</p>
                              <p className="text-sm">{transaction.diagnosis}</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t text-sm">
                            <span className="text-muted-foreground">Balance After:</span>
                            <span className="font-medium">RM {transaction.balanceAfter.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No transactions found.</p>
                      <p className="text-xs text-muted-foreground mt-2">Your transaction history will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
};