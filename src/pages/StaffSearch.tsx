import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { searchEmployees } from '@/utils/storage';
import { Employee } from '@/types';

export const StaffSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter an Employee ID or Name to search",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const results = await searchEmployees(searchQuery);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No employee found with the given search criteria",
          variant: "destructive",
        });
        setSearchResults([]);
        return;
      }

      setSearchResults(results);
      toast({
        title: "Search Complete",
        description: `Found ${results.length} employee(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search employees",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleEmployeeClick = (employee: Employee) => {
    navigate(`/dashboard/employee/${employee.id}`, {
      state: { source: 'staff-search' }
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Staff Search</h1>
        <p className="text-primary-foreground/90">
          Search employees and process medical benefit deductions
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Employee ID or Name</Label>
              <Input
                id="search"
                type="text"
                placeholder="Enter Employee ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="mt-1"
                disabled={searching}
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={handleSearch} size="lg" disabled={searching}>
                {searching ? "Searching..." : "🔍 Search"}
              </Button>
              <Button onClick={clearSearch} variant="outline" size="lg">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchResults.map((employee) => (
                <div 
                  key={employee.id} 
                  className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-muted-foreground">Employee ID: {employee.empId}</p>
                      <p className="text-muted-foreground">Company: {employee.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">
                        RM {employee.currentBalance.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of RM {employee.annualBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};