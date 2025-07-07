import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getCompanies, addEmployee, getEmployees } from '@/utils/storage';
import { Employee, UploadResult } from '@/types';

export const AdminPanel = () => {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const companies = getCompanies();

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
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      const empIdIndex = headers.findIndex(h => h.includes('emp'));
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const balanceIndex = headers.findIndex(h => h.includes('balance') || h.includes('amount'));

      if (empIdIndex === -1 || nameIndex === -1 || balanceIndex === -1) {
        throw new Error('CSV must contain EMP, Name, and Balance columns');
      }

      const existingEmployees = getEmployees();
      const company = companies.find(c => c.id === selectedCompany);
      
      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.trim());
        
        if (columns.length < 3) continue;

        const empId = columns[empIdIndex];
        const name = columns[nameIndex];
        const balance = parseFloat(columns[balanceIndex]);

        if (!empId || !name || isNaN(balance)) {
          result.errors.push(`Line ${i + 1}: Invalid data`);
          continue;
        }

        // Check for duplicates
        const existingEmp = existingEmployees.find(e => e.empId === empId);
        if (existingEmp) {
          result.duplicates.push(`${empId} - ${name}`);
          continue;
        }

        // Add employee
        addEmployee({
          empId,
          name,
          companyId: selectedCompany,
          companyName: company?.name || 'Unknown',
          annualBalance: balance,
          currentBalance: balance,
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-primary-foreground/90">
          Upload employee data and manage system settings
        </p>
      </div>

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
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
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
                CSV should contain: EMP, Name, Balance columns
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
                  <li>• <strong>Balance</strong> - Annual Balance (RM)</li>
                </ul>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Example CSV:</p>
                <pre className="text-xs">
EMP,Name,Balance{'\n'}
001,John Doe,1000{'\n'}
002,Jane Smith,1500{'\n'}
003,Ahmad Ali,2000
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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