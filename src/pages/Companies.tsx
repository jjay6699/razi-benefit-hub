import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
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
import { getCompanies, addCompany, getEmployees, deleteCompany, importEmployees } from '@/utils/storage';
import { Company, Employee } from '@/types';
import { ArrowLeft, Building2, Users, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

export const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyEmployees, setCompanyEmployees] = useState<Employee[]>([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleBackToCompanies}
              className="self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Companies
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 break-words">{selectedCompany.name}</h1>
              <p className="text-primary-foreground/90 text-sm sm:text-base">Company staff members</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Members ({companyEmployees.length})
              </div>
              <Button size="sm" onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import XLS
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEmployees ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading staff...</p>
              </div>
            ) : companyEmployees.length > 0 ? (
              <>
                {/* Mobile View - Cards */}
                <div className="block md:hidden space-y-3">
                  {companyEmployees.map((employee) => (
                    <Card 
                      key={employee.id} 
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <CardContent className="p-0 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {employee.empId}</p>
                          </div>
                          <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"} className="text-xs">
                            {employee.currentBalance > 0 ? "Active" : "Depleted"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Annual:</p>
                            <p className="font-medium">RM {employee.annualBalance.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current:</p>
                            <p className="font-medium">RM {employee.currentBalance.toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block overflow-x-auto">
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
                          <TableCell className="font-medium text-sm">{employee.empId}</TableCell>
                          <TableCell className="text-sm">{employee.name}</TableCell>
                          <TableCell className="text-sm">RM {employee.annualBalance.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">RM {employee.currentBalance.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={employee.currentBalance > 0 ? "default" : "secondary"} className="text-xs">
                              {employee.currentBalance > 0 ? "Active" : "Depleted"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
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
          <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="flex sm:flex-col sm:justify-end">
              <Button 
                onClick={handleAddCompany} 
                className="w-full sm:w-auto sm:mt-6" 
                disabled={submitting}
              >
                {submitting ? "Adding..." : "Add Company"}
              </Button>
            </div>
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
                        Created: {formatDate(company.createdAt)}
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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Employees from XLS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an Excel file with columns: <strong>NO</strong>, <strong>NAME</strong>, <strong>PASSPORT NO</strong>, <strong>Balance</strong>, <strong>REMARK</strong>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !selectedCompany) return;

                setImporting(true);
                try {
                  const XLSX = await import('xlsx');
                  const reader = new FileReader();
                  reader.onload = async (evt) => {
                    const data = evt.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);

                    const result = await importEmployees(selectedCompany.id, jsonData);

                    toast({
                      title: "Import Complete",
                      description: `Imported ${result.success} employees. ${result.duplicates.length} duplicates skipped. ${result.errors.length} errors.`,
                    });

                    if (result.success > 0) {
                      const allEmployees = await getEmployees();
                      const filteredEmployees = allEmployees.filter(emp => emp.companyId === selectedCompany.id);
                      setCompanyEmployees(filteredEmployees);
                    }

                    setImportDialogOpen(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  };
                  reader.readAsBinaryString(file);
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to parse file",
                    variant: "destructive",
                  });
                } finally {
                  setImporting(false);
                }
              }}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importing..." : "Select File"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};