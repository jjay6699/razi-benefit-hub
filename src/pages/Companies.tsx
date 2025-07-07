import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCompanies, addCompany } from '@/utils/storage';
import { Company } from '@/types';

export const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
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
                <div key={company.id} className="border border-border rounded-lg p-4">
                  <h3 className="font-medium">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(company.createdAt).toLocaleDateString()}
                  </p>
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