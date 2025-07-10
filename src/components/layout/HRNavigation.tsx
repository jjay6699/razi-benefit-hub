import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Building2 } from 'lucide-react';

export const HRNavigation = () => {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto max-w-[1300px] px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">
              AR RAZI - HR Admin
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {profile?.full_name}
            </span>
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};