import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Employee } from '@/types';
import { Search, Trash2 } from 'lucide-react';
import { EmployeeRow } from './EmployeeRow';

interface StaffListViewProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  selectedEmployees: Set<string>;
  onSearchChange: (value: string) => void;
  onEmployeeClick: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string, employeeName: string) => void;
  onBulkDelete: () => void;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onPageChange: (page: number) => void;
}

const ITEMS_PER_PAGE = 50;

export const StaffListView = ({
  employees,
  filteredEmployees,
  loading,
  searchTerm,
  currentPage,
  selectedEmployees,
  onSearchChange,
  onEmployeeClick,
  onDeleteEmployee,
  onBulkDelete,
  onSelectEmployee,
  onSelectAll,
  onPageChange,
}: StaffListViewProps) => {
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);
  
  const isAllSelected = currentEmployees.length > 0 && currentEmployees.every(emp => selectedEmployees.has(emp.id));
  const isIndeterminate = currentEmployees.some(emp => selectedEmployees.has(emp.id)) && !isAllSelected;

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Staff List</h1>
        <p className="text-primary-foreground/90">View all employees in the system</p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:gap-0">
            {/* Title and selection actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-4">
                <h2 className="text-lg sm:text-xl font-semibold">All Staff ({filteredEmployees.length})</h2>
                {selectedEmployees.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedEmployees.size} selected
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected ({selectedEmployees.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Selected Employees</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {selectedEmployees.size} employee(s)? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={onBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete All Selected
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
            
            {/* Search bar */}
            <div className="relative w-full sm:w-80 sm:ml-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, ID, or company..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading staff...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                        ref={(ref) => {
                          if (ref) {
                            const input = ref.querySelector('input');
                            if (input) input.indeterminate = isIndeterminate;
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Annual Balance</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentEmployees.map((employee) => (
                    <EmployeeRow
                      key={employee.id}
                      employee={employee}
                      isSelected={selectedEmployees.has(employee.id)}
                      onEmployeeClick={onEmployeeClick}
                      onDeleteEmployee={onDeleteEmployee}
                      onSelectEmployee={onSelectEmployee}
                    />
                  ))}
                </TableBody>
              </Table>

              {filteredEmployees.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No staff found matching your search.' : 'No staff found.'}
                  </p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {getVisiblePages().map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => onPageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} employees
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};