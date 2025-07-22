import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeById, updateEmployee, addTransaction, getEmployeeTransactions } from '@/utils/storage';
import { Employee, Transaction } from '@/types';
import { History } from 'lucide-react';
import { TransactionHistoryTable } from '@/components/staff/TransactionHistoryTable';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';
import { EmployeeDetailsCard } from '@/components/employee/EmployeeDetailsCard';
import { BalanceCard } from '@/components/employee/BalanceCard';
import { DeductionForm } from '@/components/employee/DeductionForm';

export const EmployeeDetail = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdmin, isHRAdmin } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  
  // Admin edit balance state
  const [editingAnnualBalance, setEditingAnnualBalance] = useState(false);
  const [editingCurrentBalance, setEditingCurrentBalance] = useState(false);
  const [newAnnualBalance, setNewAnnualBalance] = useState('');
  const [newCurrentBalance, setNewCurrentBalance] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);

  // Admin edit name and ID state
  const [editingEmployeeName, setEditingEmployeeName] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [updatingEmployee, setUpdatingEmployee] = useState(false);

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
    if (isHRAdmin) {
      navigate('/hr-admin');
    } else if (source === 'staff-search') {
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

  const handleUpdateEmployee = async (updateType: 'name' | 'empId') => {
    if (!employee) return;

    const newValue = updateType === 'name' ? newEmployeeName.trim() : newEmployeeId.trim();
    
    if (!newValue) {
      toast({
        title: "Error",
        description: `Please enter a valid ${updateType === 'name' ? 'name' : 'employee ID'}`,
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate employee ID if updating employee ID
    if (updateType === 'empId' && newValue !== employee.empId) {
      try {
        const { getEmployees } = await import('@/utils/storage');
        const allEmployees = await getEmployees();
        const existingEmp = allEmployees.find(e => e.empId === newValue && e.id !== employee.id);
        if (existingEmp) {
          toast({
            title: "Error",
            description: `Employee ID ${newValue} already exists`,
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error('Error checking for duplicate employee ID:', error);
      }
    }

    setUpdatingEmployee(true);

    try {
      const updateData = updateType === 'name' 
        ? { name: newValue }
        : { empId: newValue };

      const updatedEmployee = await updateEmployee(employee.id, updateData);

      if (!updatedEmployee) {
        throw new Error(`Failed to update employee ${updateType === 'name' ? 'name' : 'ID'}`);
      }

      setEmployee(updatedEmployee);
      
      if (updateType === 'name') {
        setEditingEmployeeName(false);
        setNewEmployeeName('');
      } else {
        setEditingEmployeeId(false);
        setNewEmployeeId('');
      }

      toast({
        title: "Success",
        description: `Employee ${updateType === 'name' ? 'name' : 'ID'} updated successfully`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to update ${updateType === 'name' ? 'name' : 'ID'}`,
        variant: "destructive",
      });
    } finally {
      setUpdatingEmployee(false);
    }
  };

  const startEditingEmployee = (updateType: 'name' | 'empId') => {
    if (updateType === 'name') {
      setEditingEmployeeName(true);
      setNewEmployeeName(employee?.name || '');
    } else {
      setEditingEmployeeId(true);
      setNewEmployeeId(employee?.empId || '');
    }
  };

  const cancelEditingEmployee = (updateType: 'name' | 'empId') => {
    if (updateType === 'name') {
      setEditingEmployeeName(false);
      setNewEmployeeName('');
    } else {
      setEditingEmployeeId(false);
      setNewEmployeeId('');
    }
  };

  const handleDeduction = async (formData: any) => {
    if (!employee || !formData.amount || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
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
        description: formData.description.trim(),
        diagnosis: formData.diagnosis.trim() || undefined,
        medicalLeaveGranted: formData.medicalLeave,
        mcDateFrom: formData.medicalLeave && formData.mcDateFrom ? formData.mcDateFrom.toISOString().split('T')[0] : undefined,
        mcDateTo: formData.medicalLeave && formData.mcDateTo ? formData.mcDateTo.toISOString().split('T')[0] : undefined,
        balanceAfter: newBalance,
      });

      if (!transaction) {
        throw new Error('Failed to add transaction');
      }

      // Update local state
      setEmployee(updatedEmployee);
      setTransactions([transaction, ...transactions]);

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
    }
  };

  if (loading || !employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getBackButtonText = () => {
    if (isHRAdmin) return 'Dashboard';
    if (source === 'staff-search') return 'Staff Search';
    if (source === 'companies') return 'Companies';
    return 'Staff List';
  };

  return (
    <div className="space-y-6">
      <EmployeeHeader
        employeeName={employee.name}
        employeeId={employee.empId}
        onBack={handleBack}
        backButtonText={getBackButtonText()}
        isAdmin={isAdmin}
        isEditingName={editingEmployeeName}
        editNameValue={newEmployeeName}
        isUpdating={updatingEmployee}
        onStartEditName={() => startEditingEmployee('name')}
        onCancelEditName={() => cancelEditingEmployee('name')}
        onSaveName={() => handleUpdateEmployee('name')}
        onNameValueChange={setNewEmployeeName}
      />

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <EmployeeDetailsCard
          companyName={employee.companyName}
          employeeId={employee.empId}
          joinedDate={employee.createdAt}
          isAdmin={isAdmin}
          isEditingId={editingEmployeeId}
          editIdValue={newEmployeeId}
          isUpdating={updatingEmployee}
          onStartEditId={() => startEditingEmployee('empId')}
          onCancelEditId={() => cancelEditingEmployee('empId')}
          onSaveId={() => handleUpdateEmployee('empId')}
          onIdValueChange={setNewEmployeeId}
        />

        <BalanceCard
          title="Annual Balance"
          balance={employee.annualBalance}
          isEditing={editingAnnualBalance}
          editValue={newAnnualBalance}
          isAdmin={isAdmin}
          isUpdating={updatingBalance}
          onStartEdit={() => startEditingBalance('annual')}
          onCancelEdit={() => cancelEditingBalance('annual')}
          onSave={() => handleUpdateBalance('annual')}
          onValueChange={setNewAnnualBalance}
        />

        <BalanceCard
          title="Current Balance"
          balance={employee.currentBalance}
          isEditing={editingCurrentBalance}
          editValue={newCurrentBalance}
          isAdmin={isAdmin}
          isUpdating={updatingBalance}
          showBadge={true}
          onStartEdit={() => startEditingBalance('current')}
          onCancelEdit={() => cancelEditingBalance('current')}
          onSave={() => handleUpdateBalance('current')}
          onValueChange={setNewCurrentBalance}
        />
      </div>

      {/* Process Deduction Section - Only visible to Admins */}
      {isAdmin && !isHRAdmin && (
        <DeductionForm
          availableBalance={employee.currentBalance}
          processing={false}
          onSubmit={handleDeduction}
          onReset={() => {}}
        />
      )}

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