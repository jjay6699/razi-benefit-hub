import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeById, updateEmployee, addTransaction, getEmployeeTransactions } from '@/utils/storage';
import { Employee, Transaction } from '@/types';
import { ArrowLeft, User, CreditCard, History, DollarSign, Edit, Save, X } from 'lucide-react';
import { TransactionHistoryTable } from '@/components/staff/TransactionHistoryTable';
import { format } from 'date-fns';

export const EmployeeDetail = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Process deduction form state
  const [deductionAmount, setDeductionAmount] = useState('');
  const [description, setDescription] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicalLeave, setMedicalLeave] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Admin edit balance state
  const [editingAnnualBalance, setEditingAnnualBalance] = useState(false);
  const [editingCurrentBalance, setEditingCurrentBalance] = useState(false);
  const [newAnnualBalance, setNewAnnualBalance] = useState('');
  const [newCurrentBalance, setNewCurrentBalance] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);

  // Get the source from location state for proper back navigation
  const source = location.state?.source || 'staff-list';

  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  const loadEmployeeData = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    setLoadingTransactions(true);
    
    try {
      const employeeData = await getEmployeeById(employeeId);
      if (employeeData) {
        setEmployee(employeeData);
        const empTransactions = await getEmployeeTransactions(employeeId);
        setTransactions(empTransactions);
      } else {
        toast({
          title: "Error",
          description: "Employee not found",
          variant: "destructive",
        });
        handleBack();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employee data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingTransactions(false);
    }
  };

  const handleBack = () => {
    if (source === 'staff-search') {
      navigate('/dashboard/staff');
    } else if (source === 'companies') {
      navigate('/dashboard/companies');
    } else {
      navigate('/dashboard/staff-list');
    }
  };

  const handleUpdateBalance = async (balanceType: 'annual' | 'current') => {
    if (!employee) return;

    const newValue = balanceType === 'annual' ? newAnnualBalance : newCurrentBalance;
    const amount = parseFloat(newValue);
    
    if (isNaN(amount) || amount < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setUpdatingBalance(true);

    try {
      const updateData = balanceType === 'annual' 
        ? { annualBalance: amount }
        : { currentBalance: amount };

      const updatedEmployee = await updateEmployee(employee.id, updateData);

      if (!updatedEmployee) {
        throw new Error('Failed to update employee balance');
      }

      setEmployee(updatedEmployee);
      
      if (balanceType === 'annual') {
        setEditingAnnualBalance(false);
        setNewAnnualBalance('');
      } else {
        setEditingCurrentBalance(false);
        setNewCurrentBalance('');
      }

      toast({
        title: "Success",
        description: `${balanceType === 'annual' ? 'Annual' : 'Current'} balance updated successfully`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update balance",
        variant: "destructive",
      });
    } finally {
      setUpdatingBalance(false);
    }
  };

  const startEditingBalance = (balanceType: 'annual' | 'current') => {
    if (balanceType === 'annual') {
      setEditingAnnualBalance(true);
      setNewAnnualBalance(employee?.annualBalance.toString() || '');
    } else {
      setEditingCurrentBalance(true);
      setNewCurrentBalance(employee?.currentBalance.toString() || '');
    }
  };

  const cancelEditingBalance = (balanceType: 'annual' | 'current') => {
    if (balanceType === 'annual') {
      setEditingAnnualBalance(false);
      setNewAnnualBalance('');
    } else {
      setEditingCurrentBalance(false);
      setNewCurrentBalance('');
    }
  };

  const handleDeduction = async () => {
    if (!employee || !deductionAmount || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(deductionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid deduction amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > employee.currentBalance) {
      toast({
        title: "Error",
        description: "Deduction amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const newBalance = employee.currentBalance - amount;
      
      // Update employee balance
      const updatedEmployee = await updateEmployee(employee.id, {
        currentBalance: newBalance
      });

      if (!updatedEmployee) {
        throw new Error('Failed to update employee balance');
      }

      // Add transaction
      const transaction = await addTransaction({
        employeeId: employee.id,
        employeeName: employee.name,
        employeeEmpId: employee.empId,
        companyName: employee.companyName,
        amount: amount,
        description: description.trim(),
        diagnosis: diagnosis.trim() || undefined,
        medicalLeaveGranted: medicalLeave,
        balanceAfter: newBalance,
      });

      if (!transaction) {
        throw new Error('Failed to add transaction');
      }

      // Update local state
      setEmployee(updatedEmployee);
      setTransactions([transaction, ...transactions]);
      setDeductionAmount('');
      setDescription('');
      setDiagnosis('');
      setMedicalLeave(false);

      toast({
        title: "Success",
        description: `Deduction of RM ${amount.toFixed(2)} processed successfully`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process deduction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleBack}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {source === 'staff-search' ? 'Staff Search' : source === 'companies' ? 'Companies' : 'Staff List'}
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 break-words">{employee.name}</h1>
            <p className="text-primary-foreground/90 text-sm sm:text-base">Employee ID: {employee.empId}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Company</p>
                <p className="font-medium text-sm sm:text-base break-words">{employee.companyName}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium text-sm sm:text-base">{employee.empId}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Joined</p>
                <p className="font-medium text-sm sm:text-base">{format(new Date(employee.createdAt), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Annual Balance
              </div>
              {isAdmin && !editingAnnualBalance && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditingBalance('annual')}
                  disabled={updatingBalance}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingAnnualBalance ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAnnualBalance}
                  onChange={(e) => setNewAnnualBalance(e.target.value)}
                  disabled={updatingBalance}
                  className="text-lg font-semibold"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateBalance('annual')}
                    disabled={updatingBalance || !newAnnualBalance}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelEditingBalance('annual')}
                    disabled={updatingBalance}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  RM {employee.annualBalance.toFixed(2)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Total allocated for the year
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                Current Balance
              </div>
              {isAdmin && !editingCurrentBalance && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditingBalance('current')}
                  disabled={updatingBalance}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingCurrentBalance ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCurrentBalance}
                  onChange={(e) => setNewCurrentBalance(e.target.value)}
                  disabled={updatingBalance}
                  className="text-lg font-semibold"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateBalance('current')}
                    disabled={updatingBalance || !newCurrentBalance}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelEditingBalance('current')}
                    disabled={updatingBalance}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  RM {employee.currentBalance.toFixed(2)}
                </div>
                <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"} className="mt-2">
                  {employee.currentBalance > 0 ? "Active" : "Depleted"}
                </Badge>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Process Deduction Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Process Deduction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Deduction Amount (RM) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={employee.currentBalance}
                  placeholder="0.00"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  disabled={processing}
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Available: RM {employee.currentBalance.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Medical consultation, medicine, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={processing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-sm font-medium">
                Diagnosis (Optional)
              </Label>
              <Input
                id="diagnosis"
                type="text"
                placeholder="e.g., Fever, Headache, etc."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={processing}
              />
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
              <Checkbox
                id="medicalLeave"
                checked={medicalLeave}
                onCheckedChange={(checked) => setMedicalLeave(!!checked)}
                disabled={processing}
              />
              <Label htmlFor="medicalLeave" className="text-sm font-medium cursor-pointer">
                Medical Leave (MC) Granted
              </Label>
            </div>

            <Button 
              onClick={handleDeduction}
              disabled={processing || !deductionAmount || !description || employee.currentBalance <= 0}
              className="w-full mt-6"
              size="lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Process Deduction
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistoryTable 
            transactions={transactions}
            loading={loadingTransactions}
          />
        </CardContent>
      </Card>
    </div>
  );
};