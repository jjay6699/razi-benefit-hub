import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getCompanies, addEmployee, getEmployees, getAllProfiles, updateUserProfile, updateEmployee } from '@/utils/storage';
import { Employee, UploadResult, Company } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export const AdminPanel = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Manual employee form state
  const [manualEmployee, setManualEmployee] = useState({
    empId: '',
    name: '',
    companyId: '',
    annualBalance: '',
    currentBalance: '',
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  // HR Admin form state
  const [hrAdminForm, setHrAdminForm] = useState({
    email: '',
    password: '',
    fullName: '',
    companyId: '',
  });
  const [submittingHRAdmin, setSubmittingHRAdmin] = useState(false);

  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userEditForm, setUserEditForm] = useState({
    fullName: '',
    companyId: '',
    role: '',
    email: '',
    newPassword: '',
  });

  // Employee management state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeEditForm, setEmployeeEditForm] = useState({
    name: '',
    empId: '',
  });
  
  const { toast } = useToast();
  const { createHRAdmin, deleteUser, changeUserPassword, changeUserEmail } = useAuth();

  useEffect(() => {
    loadCompanies();
    loadUsers();
    loadEmployees();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const companiesData = await getCompanies();
    setCompanies(companiesData);
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const profiles = await getAllProfiles();
      setUsers(profiles);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const employeesData = await getEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Proper CSV parsing function that handles quoted fields and commas within values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator outside quotes
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a company and choose a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const result: UploadResult = { success: 0, errors: [], duplicates: [] };

    try {
      const text = await file.text();
      // Normalize line endings and filter out truly empty lines
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
        .split('\n')
        .filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
      
      const empIdIndex = headers.findIndex(h => h.includes('emp'));
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const annualBalanceIndex = headers.findIndex(h => h.includes('annual') && h.includes('balance'));
      const currentBalanceIndex = headers.findIndex(h => h.includes('current') && h.includes('balance'));

      if (empIdIndex === -1 || nameIndex === -1 || annualBalanceIndex === -1 || currentBalanceIndex === -1) {
        throw new Error('CSV must contain EMP, Name, Annual Balance, and Current Balance columns');
      }

      const existingEmployees = await getEmployees();
      const company = companies.find(c => c.id === selectedCompany);
      
      for (let i = 1; i < lines.length; i++) {
        const columns = parseCSVLine(lines[i]);
        
        // Ensure we have enough columns
        if (columns.length < Math.max(empIdIndex, nameIndex, annualBalanceIndex, currentBalanceIndex) + 1) {
          result.errors.push(`Line ${i + 1}: Insufficient columns`);
          continue;
        }

        const empId = columns[empIdIndex]?.trim();
        const name = columns[nameIndex]?.trim();
        const annualBalanceStr = columns[annualBalanceIndex]?.trim();
        const currentBalanceStr = columns[currentBalanceIndex]?.trim();
        const annualBalance = parseFloat(annualBalanceStr || '0');
        const currentBalance = parseFloat(currentBalanceStr || '0');

        if (!empId || !name || !annualBalanceStr || !currentBalanceStr || isNaN(annualBalance) || isNaN(currentBalance)) {
          result.errors.push(`Line ${i + 1}: Missing or invalid data - EMP: "${empId}", Name: "${name}", Annual Balance: "${annualBalanceStr}", Current Balance: "${currentBalanceStr}"`);
          continue;
        }

        // Check for duplicates
        const existingEmp = existingEmployees.find(e => e.empId === empId);
        if (existingEmp) {
          result.duplicates.push(`${empId} - ${name}`);
          continue;
        }

        // Add employee
        await addEmployee({
          empId,
          name,
          companyId: selectedCompany,
          companyName: company?.name || 'Unknown',
          annualBalance,
          currentBalance,
        });

        result.success++;
      }

      setUploadResult(result);
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${result.success} employees`,
      });
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualEmployee.empId || !manualEmployee.name || !manualEmployee.companyId || !manualEmployee.annualBalance || !manualEmployee.currentBalance) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const annualBalance = parseFloat(manualEmployee.annualBalance);
    const currentBalance = parseFloat(manualEmployee.currentBalance);
    if (isNaN(annualBalance) || annualBalance < 0 || isNaN(currentBalance) || currentBalance < 0) {
      toast({
        title: "Error",
        description: "Please enter valid balance amounts",
        variant: "destructive",
      });
      return;
    }

    setSubmittingManual(true);
    
    try {
      // Check for duplicates
      const existingEmployees = await getEmployees();
      const existingEmp = existingEmployees.find(e => e.empId === manualEmployee.empId);
      
      if (existingEmp) {
        toast({
          title: "Error",
          description: `Employee ID ${manualEmployee.empId} already exists`,
          variant: "destructive",
        });
        return;
      }

      const company = companies.find(c => c.id === manualEmployee.companyId);
      
      const result = await addEmployee({
        empId: manualEmployee.empId,
        name: manualEmployee.name,
        companyId: manualEmployee.companyId,
        companyName: company?.name || 'Unknown',
        annualBalance,
        currentBalance,
      });

      if (result) {
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
        
        // Reset form
        setManualEmployee({
          empId: '',
          name: '',
          companyId: '',
          annualBalance: '',
          currentBalance: '',
        });
      } else {
        throw new Error('Failed to add employee');
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add employee',
        variant: "destructive",
      });
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleHRAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hrAdminForm.email || !hrAdminForm.password || !hrAdminForm.fullName || !hrAdminForm.companyId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (hrAdminForm.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setSubmittingHRAdmin(true);
    
    try {
      const { error } = await createHRAdmin(
        hrAdminForm.email,
        hrAdminForm.password,
        hrAdminForm.fullName,
        hrAdminForm.companyId
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "HR Admin created successfully",
      });
      
      // Reset form
      setHrAdminForm({
        email: '',
        password: '',
        fullName: '',
        companyId: '',
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create HR Admin',
        variant: "destructive",
      });
    } finally {
      setSubmittingHRAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-primary-foreground/90">
          Upload employee data and manage system settings
        </p>
      </div>

      <Tabs defaultValue="csv" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="hradmin">HR Admin</TabsTrigger>
          <TabsTrigger value="employees">Employee Edit</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Employee Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Select Company</Label>
              <select
                id="company"
                className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                  <option value="">Choose a company...</option>
                  {loading ? (
                    <option disabled>Loading companies...</option>
                  ) : (
                    companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))
                  )}
              </select>
            </div>

            <div>
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={!selectedCompany || uploading}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                CSV should contain: EMP, Name, Annual Balance, Current Balance columns
              </p>
            </div>

            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Required Columns:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <strong>EMP</strong> - Employee ID</li>
                  <li>• <strong>Name</strong> - Full Name</li>
                  <li>• <strong>Annual Balance</strong> - Annual Balance (RM)</li>
                  <li>• <strong>Current Balance</strong> - Current Balance (RM)</li>
                </ul>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Example CSV:</p>
                <pre className="text-xs">
EMP,Name,Annual Balance,Current Balance{'\n'}
001,John Doe,1000,850{'\n'}
002,Jane Smith,1500,1200{'\n'}
003,Ahmad Ali,2000,1800
                </pre>
              </div>
            </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Employee Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="empId">Employee ID</Label>
                    <Input
                      id="empId"
                      value={manualEmployee.empId}
                      onChange={(e) => setManualEmployee(prev => ({ ...prev, empId: e.target.value }))}
                      placeholder="e.g., 001"
                      disabled={submittingManual}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employeeName">Full Name</Label>
                    <Input
                      id="employeeName"
                      value={manualEmployee.name}
                      onChange={(e) => setManualEmployee(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., John Doe"
                      disabled={submittingManual}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="manualCompany">Company</Label>
                  <select
                    id="manualCompany"
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                    value={manualEmployee.companyId}
                    onChange={(e) => setManualEmployee(prev => ({ ...prev, companyId: e.target.value }))}
                    disabled={submittingManual || loading}
                  >
                    <option value="">Choose a company...</option>
                    {loading ? (
                      <option disabled>Loading companies...</option>
                    ) : (
                      companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="annualBalance">Annual Balance (RM)</Label>
                    <Input
                      id="annualBalance"
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualEmployee.annualBalance}
                      onChange={(e) => setManualEmployee(prev => ({ ...prev, annualBalance: e.target.value }))}
                      placeholder="e.g., 1000.00"
                      disabled={submittingManual}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentBalance">Current Balance (RM)</Label>
                    <Input
                      id="currentBalance"
                      type="number"
                      step="0.01"
                      min="0"
                      value={manualEmployee.currentBalance}
                      onChange={(e) => setManualEmployee(prev => ({ ...prev, currentBalance: e.target.value }))}
                      placeholder="e.g., 850.00"
                      disabled={submittingManual}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingManual || loading}
                  className="w-full"
                >
                  {submittingManual ? "Adding Employee..." : "Add Employee"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hradmin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create HR Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleHRAdminSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hrEmail">Email</Label>
                    <Input
                      id="hrEmail"
                      type="email"
                      value={hrAdminForm.email}
                      onChange={(e) => setHrAdminForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="admin@company.com"
                      disabled={submittingHRAdmin}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hrPassword">Password</Label>
                    <Input
                      id="hrPassword"
                      type="password"
                      value={hrAdminForm.password}
                      onChange={(e) => setHrAdminForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 6 characters"
                      disabled={submittingHRAdmin}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hrFullName">Full Name</Label>
                    <Input
                      id="hrFullName"
                      value={hrAdminForm.fullName}
                      onChange={(e) => setHrAdminForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="e.g., John Doe"
                      disabled={submittingHRAdmin}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hrCompany">Assign Company</Label>
                    <select
                      id="hrCompany"
                      className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                      value={hrAdminForm.companyId}
                      onChange={(e) => setHrAdminForm(prev => ({ ...prev, companyId: e.target.value }))}
                      disabled={submittingHRAdmin || loading}
                    >
                      <option value="">Choose a company...</option>
                      {loading ? (
                        <option disabled>Loading companies...</option>
                      ) : (
                        companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submittingHRAdmin || loading}
                  className="w-full"
                >
                  {submittingHRAdmin ? "Creating HR Admin..." : "Create HR Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users found</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium">{user.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Role: {user.role} | 
                              {user.companies?.name ? ` Company: ${user.companies.name}` : ' No company assigned'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(user.created_at).toLocaleDateString('en-GB')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setUserEditForm({
                              fullName: user.full_name,
                              companyId: user.company_id || '',
                              role: user.role,
                              email: '', // We'll fetch this separately if needed
                              newPassword: '',
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                              try {
                                const { error } = await deleteUser(user.user_id);
                                if (error) throw error;
                                
                                toast({
                                  title: "Success",
                                  description: "User deleted successfully",
                                });
                                
                                await loadUsers();
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to delete user",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {editingUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Edit User: {editingUser.full_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editFullName">Full Name</Label>
                    <Input
                      id="editFullName"
                      value={userEditForm.fullName}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editEmail">Email</Label>
                    <Input
                      id="editEmail"
                      type="email"
                      value={userEditForm.email}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter new email (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editPassword">New Password</Label>
                    <Input
                      id="editPassword"
                      type="password"
                      value={userEditForm.newPassword}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password (optional)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editRole">Role</Label>
                    <select
                      id="editRole"
                      className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                      value={userEditForm.role}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="patient">Patient</option>
                      <option value="hr_admin">HR Admin</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="editCompany">Company Assignment</Label>
                    <select
                      id="editCompany"
                      className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                      value={userEditForm.companyId}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, companyId: e.target.value }))}
                    >
                      <option value="">No company assigned</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          // Update profile
                          await updateUserProfile(editingUser.user_id, {
                            full_name: userEditForm.fullName,
                            company_id: userEditForm.companyId || null,
                            role: userEditForm.role,
                          });

                          // Update email if provided
                          if (userEditForm.email && userEditForm.email !== editingUser.email) {
                            const { error: emailError } = await changeUserEmail(editingUser.user_id, userEditForm.email);
                            if (emailError) throw emailError;
                          }

                          // Update password if provided
                          if (userEditForm.newPassword) {
                            const { error: passwordError } = await changeUserPassword(editingUser.user_id, userEditForm.newPassword);
                            if (passwordError) throw passwordError;
                          }
                          
                          toast({
                            title: "Success",
                            description: "User updated successfully",
                          });
                          
                          setEditingUser(null);
                          await loadUsers();
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to update user",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Employee Management</CardTitle>
              <p className="text-sm text-muted-foreground">Edit employee names and IDs (Admin only)</p>
            </CardHeader>
            <CardContent>
              {loadingEmployees ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading employees...</p>
                </div>
              ) : employees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No employees found</p>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium">{employee.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Employee ID: {employee.empId} | Company: {employee.companyName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Annual: RM{employee.annualBalance.toFixed(2)} | Current: RM{employee.currentBalance.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingEmployee(employee);
                            setEmployeeEditForm({
                              name: employee.name,
                              empId: employee.empId,
                            });
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {editingEmployee && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Edit Employee: {editingEmployee.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editEmployeeName">Employee Name</Label>
                    <Input
                      id="editEmployeeName"
                      value={employeeEditForm.name}
                      onChange={(e) => setEmployeeEditForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter employee name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="editEmployeeId">Employee ID</Label>
                    <Input
                      id="editEmployeeId"
                      value={employeeEditForm.empId}
                      onChange={(e) => setEmployeeEditForm(prev => ({ ...prev, empId: e.target.value }))}
                      placeholder="Enter employee ID"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        try {
                          // Check for duplicate employee IDs if the ID is being changed
                          if (employeeEditForm.empId !== editingEmployee.empId) {
                            const existingEmp = employees.find(e => e.empId === employeeEditForm.empId && e.id !== editingEmployee.id);
                            if (existingEmp) {
                              toast({
                                title: "Error",
                                description: `Employee ID ${employeeEditForm.empId} already exists`,
                                variant: "destructive",
                              });
                              return;
                            }
                          }

                          // Update employee
                          const result = await updateEmployee(editingEmployee.id, {
                            name: employeeEditForm.name,
                            empId: employeeEditForm.empId,
                          });

                          if (result) {
                            toast({
                              title: "Success",
                              description: "Employee updated successfully",
                            });
                            
                            setEditingEmployee(null);
                            await loadEmployees();
                          } else {
                            throw new Error('Failed to update employee');
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: error instanceof Error ? error.message : "Failed to update employee",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingEmployee(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-success">✅</span>
                <span>Successfully uploaded: {uploadResult.success} employees</span>
              </div>
              
              {uploadResult.duplicates.length > 0 && (
                <div>
                  <h4 className="font-medium text-warning mb-2">⚠️ Duplicates Skipped:</h4>
                  <div className="bg-warning/10 p-3 rounded-md max-h-32 overflow-y-auto">
                    {uploadResult.duplicates.map((dup, index) => (
                      <div key={index} className="text-sm">{dup}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-destructive mb-2">❌ Errors:</h4>
                  <div className="bg-destructive/10 p-3 rounded-md max-h-32 overflow-y-auto">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="text-sm">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};