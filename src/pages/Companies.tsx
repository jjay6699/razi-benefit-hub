import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getCompanies, addCompany, getEmployees, deleteCompany } from '@/utils/storage';
import { Company, Employee } from '@/types';
import { ArrowLeft, Building2, Users, Trash2 } from 'lucide-react';

export const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyEmployees, setCompanyEmployees] = useState<Employee[]>([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    const companiesData = await getCompanies();
    setCompanies(companiesData);
    setLoading(false);
  };

  const handleAddCompany = async () => {
    if (!newCompanyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newCompany = await addCompany({ name: newCompanyName.trim() });
      if (newCompany) {
        setCompanies([...companies, newCompany]);
        setNewCompanyName('');
        
        toast({
          title: "Success",
          description: "Company added successfully",
        });
      } else {
        throw new Error('Failed to add company');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add company',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompanyClick = async (company: Company) => {
    setSelectedCompany(company);
    setLoadingEmployees(true);
    
    try {
      const allEmployees = await getEmployees();
      const filteredEmployees = allEmployees.filter(emp => emp.companyId === company.id);
      setCompanyEmployees(filteredEmployees);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load company employees",
        variant: "destructive",
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setCompanyEmployees([]);
  };

  const handleEmployeeClick = (employee: Employee) => {
    navigate(`/dashboard/employee/${employee.id}`, {
      state: { source: 'companies' }
    });
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    try {
      const success = await deleteCompany(companyId);
      if (success) {
        setCompanies(companies.filter(comp => comp.id !== companyId));
        toast({
          title: "Success",
          description: `${companyName} has been deleted successfully`,
        });
      } else {
        throw new Error('Failed to delete company');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete company',
        variant: "destructive",
      });
    }
  };

  if (selectedCompany) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleBackToCompanies}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">{selectedCompany.name}</h1>
              <p className="text-primary-foreground/90">Company staff members</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Members ({companyEmployees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmployees ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading staff...</p>
              </div>
            ) : companyEmployees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Annual Balance</TableHead>
                    <TableHead>Current Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyEmployees.map((employee) => (
                    <TableRow 
                      key={employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <TableCell className="font-medium">{employee.empId}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>RM {employee.annualBalance.toFixed(2)}</TableCell>
                      <TableCell>RM {employee.currentBalance.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"}>
                          {employee.currentBalance > 0 ? "Active" : "Depleted"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No staff members found for this company.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Company Management</h1>
        <p className="text-primary-foreground/90">Manage companies in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter company name..."
                className="mt-1"
                disabled={submitting}
              />
            </div>
            <Button onClick={handleAddCompany} className="mt-6" disabled={submitting}>
              {submitting ? "Adding..." : "Add Company"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Companies ({companies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading companies...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {companies.map((company) => (
                <div 
                  key={company.id} 
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <h3 className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click to view staff →
                      </p>
                    </div>
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
                          <AlertDialogTitle>Delete Company</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {company.name}? This action cannot be undone and will affect all associated employees.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCompany(company.id, company.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No companies added yet. Add your first company above.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};