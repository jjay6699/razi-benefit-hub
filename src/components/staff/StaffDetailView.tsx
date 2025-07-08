import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Employee, Transaction } from '@/types';
import { ArrowLeft, User, CreditCard, History } from 'lucide-react';
import { TransactionHistoryTable } from './TransactionHistoryTable';
import { format } from 'date-fns';

interface StaffDetailViewProps {
  employee: Employee;
  transactions: Transaction[];
  loadingTransactions: boolean;
  onBackToList: () => void;
}

export const StaffDetailView = ({ 
  employee, 
  transactions, 
  loadingTransactions, 
  onBackToList 
}: StaffDetailViewProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onBackToList}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff List
            </Button>
          </div>
          <div className="text-center">
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