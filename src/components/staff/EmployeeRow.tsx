import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Employee } from '@/types';
import { Trash2 } from 'lucide-react';

interface EmployeeRowProps {
  employee: Employee;
  onEmployeeClick: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string, employeeName: string) => void;
}

export const EmployeeRow = ({ employee, onEmployeeClick, onDeleteEmployee }: EmployeeRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onEmployeeClick(employee)}
    >
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
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700"
              onClick={(e) => e.stopPropagation()}
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