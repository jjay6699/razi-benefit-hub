import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { searchEmployees, updateEmployee, addTransaction, getEmployeeTransactions } from '@/utils/storage';
import { Employee, Transaction } from '@/types';
import { format } from 'date-fns';

export const StaffSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deductionAmount, setDeductionAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter an Employee ID or Name to search",
        variant: "destructive",
      });
      return;
    }

    const results = searchEmployees(searchQuery);
    
    if (results.length === 0) {
      toast({
        title: "No Results",
        description: "No employee found with the given search criteria",
        variant: "destructive",
      });
      setSelectedEmployee(null);
      setTransactions([]);
      return;
    }

    if (results.length === 1) {
      const employee = results[0];
      setSelectedEmployee(employee);
      setTransactions(getEmployeeTransactions(employee.id));
      toast({
        title: "Employee Found",
        description: `Found: ${employee.name} (${employee.empId})`,
      });
    } else {
      // Multiple results - show first one for now
      const employee = results[0];
      setSelectedEmployee(employee);
      setTransactions(getEmployeeTransactions(employee.id));
      toast({
        title: "Multiple Results",
        description: `Found ${results.length} employees. Showing: ${employee.name}`,
      });
    }
  };

  const handleDeduction = async () => {
    if (!selectedEmployee || !deductionAmount || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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

    if (amount > selectedEmployee.currentBalance) {
      toast({
        title: "Error",
        description: "Deduction amount exceeds available balance",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const newBalance = selectedEmployee.currentBalance - amount;
      
      // Update employee balance
      const updatedEmployee = updateEmployee(selectedEmployee.id, {
        currentBalance: newBalance
      });

      if (!updatedEmployee) {
        throw new Error('Failed to update employee balance');
      }

      // Add transaction
      const transaction = addTransaction({
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.name,
        employeeEmpId: selectedEmployee.empId,
        companyName: selectedEmployee.companyName,
        amount: amount,
        description: description.trim(),
        balanceAfter: newBalance,
      });

      // Update local state
      setSelectedEmployee(updatedEmployee);
      setTransactions([transaction, ...transactions]);
      setDeductionAmount('');
      setDescription('');

      toast({
        title: "Success",
        description: `Deduction of RM ${amount.toFixed(2)} processed successfully`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process deduction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedEmployee(null);
    setTransactions([]);
    setDeductionAmount('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Staff Search</h1>
        <p className="text-primary-foreground/90">
          Search employees and process medical benefit deductions
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Employee ID or Name</Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter Employee ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={handleSearch} size="lg">
                🔍 Search
              </Button>
              <Button onClick={clearSearch} variant="outline" size="lg">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedEmployee && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Details */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Employee ID</Label>
                    <p className="font-medium">{selectedEmployee.empId}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedEmployee.name}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground">Company</Label>
                  <p className="font-medium">{selectedEmployee.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Annual Balance</Label>
                    <p className="font-medium">RM {selectedEmployee.annualBalance.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Current Balance</Label>
                    <p className={`font-bold text-lg ${selectedEmployee.currentBalance > 0 ? 'text-success' : 'text-destructive'}`}>
                      RM {selectedEmployee.currentBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deduction Form */}
          <Card>
            <CardHeader>
              <CardTitle>Process Deduction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Deduction Amount (RM)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedEmployee.currentBalance}
                    placeholder="0.00"
                    value={deductionAmount}
                    onChange={(e) => setDeductionAmount(e.target.value)}
                    className="mt-1"
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
                  />
                </div>

                <Button 
                  onClick={handleDeduction}
                  disabled={processing || !deductionAmount || !description}
                  className="w-full"
                  size="lg"
                >
                  {processing ? 'Processing...' : '💳 Process Deduction'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transaction History */}
      {selectedEmployee && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">-RM {transaction.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Balance: RM {transaction.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};