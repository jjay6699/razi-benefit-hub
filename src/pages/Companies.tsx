import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { getCompanies, addCompany, getEmployees } from '@/utils/storage';
import { Company, Employee } from '@/types';
import { ArrowLeft, Building2, Users } from 'lucide-react';

export const Companies = () => {
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

  if (selectedCompany) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToCompanies}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
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
                    <TableRow key={employee.id}>
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
                  className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleCompanyClick(company)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(company.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Click to view staff →
                    </div>
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