import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { getEmployeeById, updateEmployee, addTransaction, getEmployeeTransactions } from '@/utils/storage';
import { Employee, Transaction } from '@/types';
import { ArrowLeft, User, CreditCard, History, DollarSign } from 'lucide-react';
import { TransactionHistoryTable } from '@/components/staff/TransactionHistoryTable';
import { format } from 'date-fns';

export const EmployeeDetail = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
      navigate('/staff-search');
    } else {
      navigate('/staff-list');
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
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {source === 'staff-search' ? 'Staff Search' : 'Staff List'}
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">{employee.name}</h1>
            <p className="text-primary-foreground/90">Employee ID: {employee.empId}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{employee.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="font-medium">{employee.empId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{format(new Date(employee.createdAt), 'dd/MM/yyyy')}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Deduction Amount (RM)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={employee.currentBalance}
                placeholder="0.00"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(e.target.value)}
                className="mt-1"
                disabled={processing}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Medical consultation, medicine, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                disabled={processing}
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
              <Input
                id="diagnosis"
                type="text"
                placeholder="e.g., Fever, Headache, etc."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="mt-1"
                disabled={processing}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="medicalLeave"
                checked={medicalLeave}
                onCheckedChange={(checked) => setMedicalLeave(!!checked)}
                disabled={processing}
              />
              <Label htmlFor="medicalLeave">Medical Leave (MC) Granted</Label>
            </div>
          </div>

          <Button 
            onClick={handleDeduction}
            disabled={processing || !deductionAmount || !description || employee.currentBalance <= 0}
            className="w-full mt-4"
            size="lg"
          >
            {processing ? 'Processing...' : '💳 Process Deduction'}
          </Button>
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