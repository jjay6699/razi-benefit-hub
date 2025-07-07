import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const PatientHeader = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto max-w-[1300px] px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">AR RAZI</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {profile?.full_name?.split(' ')[0] || 'User'}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
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