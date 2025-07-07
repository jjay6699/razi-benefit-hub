import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getEmployees, deleteEmployee } from '@/utils/storage';
import { Employee } from '@/types';
import { StaffListView } from '@/components/staff/StaffListView';

export const StaffList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

  const handleEmployeeClick = (employee: Employee) => {
    navigate(`/dashboard/employee/${employee.id}`, {
      state: { source: 'staff-list' }
    });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  // Handle navigation state from Companies page
  useEffect(() => {
    const selectedEmployeeId = location.state?.selectedEmployeeId;
    if (selectedEmployeeId && employees.length > 0) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      if (employee) {
        handleEmployeeClick(employee);
      }
    }
  }, [employees, location.state]);

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

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    try {
      const success = await deleteEmployee(employeeId);
      if (success) {
        setEmployees(employees.filter(emp => emp.id !== employeeId));
        setSelectedEmployees(prev => {
          const newSet = new Set(prev);
          newSet.delete(employeeId);
          return newSet;
        });
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

  const handleBulkDelete = async () => {
    const selectedEmployeesList = employees.filter(emp => selectedEmployees.has(emp.id));
    
    try {
      const deletePromises = selectedEmployeesList.map(emp => deleteEmployee(emp.id));
      const results = await Promise.all(deletePromises);
      
      if (results.every(result => result)) {
        setEmployees(employees.filter(emp => !selectedEmployees.has(emp.id)));
        setSelectedEmployees(new Set());
        toast({
          title: "Success",
          description: `${selectedEmployeesList.length} employee(s) deleted successfully`,
        });
      } else {
        throw new Error('Some employees could not be deleted');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete selected employees',
        variant: "destructive",
      });
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(employeeId);
      } else {
        newSet.delete(employeeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };


  return (
    <StaffListView
      employees={employees}
      filteredEmployees={filteredEmployees}
      loading={loading}
      searchTerm={searchTerm}
      currentPage={currentPage}
      selectedEmployees={selectedEmployees}
      onSearchChange={setSearchTerm}
      onEmployeeClick={handleEmployeeClick}
      onDeleteEmployee={handleDeleteEmployee}
      onBulkDelete={handleBulkDelete}
      onSelectEmployee={handleSelectEmployee}
      onSelectAll={handleSelectAll}
      onPageChange={handlePageChange}
    />
  );
};