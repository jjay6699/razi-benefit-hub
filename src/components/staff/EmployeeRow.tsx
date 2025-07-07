import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Employee } from '@/types';
import { Trash2 } from 'lucide-react';

interface EmployeeRowProps {
  employee: Employee;
  isSelected: boolean;
  onEmployeeClick: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string, employeeName: string) => void;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
}

export const EmployeeRow = ({ 
  employee, 
  isSelected, 
  onEmployeeClick, 
  onDeleteEmployee, 
  onSelectEmployee 
}: EmployeeRowProps) => {
  
  const handleRowClick = (e: React.MouseEvent) => {
    // Prevent row click if clicking on checkbox or action buttons
    const target = e.target as HTMLElement;
    if (target.closest('[data-prevent-row-click]')) {
      return;
    }
    onEmployeeClick(employee);
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleRowClick}
    >
      <TableCell data-prevent-row-click>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={(checked) => onSelectEmployee(employee.id, !!checked)}
        />
      </TableCell>
      <TableCell className="font-medium">{employee.empId}</TableCell>
      <TableCell>{employee.name}</TableCell>
      <TableCell>{employee.companyName}</TableCell>
      <TableCell>RM {employee.annualBalance.toFixed(2)}</TableCell>
      <TableCell>RM {employee.currentBalance.toFixed(2)}</TableCell>
      <TableCell>
        <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"}>
          {employee.currentBalance > 0 ? "Active" : "Depleted"}
        </Badge>
      </TableCell>
      <TableCell data-prevent-row-click>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Employee</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {employee.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDeleteEmployee(employee.id, employee.name)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
};