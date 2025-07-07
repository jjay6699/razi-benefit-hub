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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name}</h1>
              <p className="text-primary-foreground/90">Your Medical Benefit Portal</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {!employee ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Employee Record Not Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find your employee record in our system. Please contact your HR department or system administrator.
              </p>
              <div className="bg-muted rounded-lg p-4 text-left max-w-md mx-auto">
                <h3 className="font-medium mb-2">Your Profile Information:</h3>
                <p><strong>Name:</strong> {profile?.full_name}</p>
                <p><strong>IC Number:</strong> {profile?.ic_number}</p>
                <p><strong>Phone:</strong> {profile?.phone_number}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Profile Information */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{profile?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IC Number</p>
                      <p className="font-medium">{profile?.ic_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{employee.empId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{employee.companyName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Annual Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    RM {employee.annualBalance.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total allocated for the year
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    RM {employee.currentBalance.toFixed(2)}
                  </div>
                  <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"} className="mt-2">
                    {employee.currentBalance > 0 ? "Active" : "Depleted"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available for medical claims
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History ({transactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTransactions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>MC Status</TableHead>
                        <TableHead>Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.diagnosis ? (
                              <span className="text-sm">{transaction.diagnosis}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">RM {transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.medicalLeaveGranted ? "default" : "secondary"}>
                              {transaction.medicalLeaveGranted ? "Granted" : "Not Granted"}
                            </Badge>
                          </TableCell>
                          <TableCell>RM {transaction.balanceAfter.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};