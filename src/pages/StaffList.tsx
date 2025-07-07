import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getEmployees, deleteEmployee, getEmployeeTransactions } from '@/utils/storage';
import { Employee, Transaction } from '@/types';
import { StaffListView } from '@/components/staff/StaffListView';
import { StaffDetailView } from '@/components/staff/StaffDetailView';

export const StaffList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeTransactions, setEmployeeTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const employeesData = await getEmployees();
      setEmployees(employeesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees);
      setCurrentPage(1);
      return;
    }

    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEmployeeClick = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setLoadingTransactions(true);
    
    try {
      const transactions = await getEmployeeTransactions(employee.id);
      setEmployeeTransactions(transactions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employee transactions",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setEmployeeTransactions([]);
  };

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    try {
      const success = await deleteEmployee(employeeId);
      if (success) {
        setEmployees(employees.filter(emp => emp.id !== employeeId));
        toast({
          title: "Success",
          description: `${employeeName} has been deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete employee');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete employee',
        variant: "destructive",
      });
    }
  };


  if (selectedEmployee) {
    return (
      <StaffDetailView
        employee={selectedEmployee}
        transactions={employeeTransactions}
        loadingTransactions={loadingTransactions}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <StaffListView
      employees={employees}
      filteredEmployees={filteredEmployees}
      loading={loading}
      searchTerm={searchTerm}
      currentPage={currentPage}
      onSearchChange={setSearchTerm}
      onEmployeeClick={handleEmployeeClick}
      onDeleteEmployee={handleDeleteEmployee}
      onPageChange={handlePageChange}
    />
  );
};