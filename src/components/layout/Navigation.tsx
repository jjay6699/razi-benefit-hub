import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/dashboard/admin', label: 'Admin Panel', icon: '⚙️' },
  { path: '/dashboard/staff', label: 'Staff Search', icon: '🔍' },
  { path: '/dashboard/staff-list', label: 'Staff List', icon: '👥' },
  { path: '/dashboard/companies', label: 'Companies', icon: '🏢' },
  { path: '/dashboard/reports', label: 'Reports', icon: '📈' },
];

export const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();
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
      <div className="container mx-auto max-w-[1300px] px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">
              AR RAZI
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                className={cn(
                  'flex items-center space-x-2',
                  location.pathname === item.path && 'bg-primary text-primary-foreground'
                )}
              >
                <Link to={item.path}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <select 
              className="bg-background border border-border rounded-md px-3 py-2"
              value={location.pathname}
              onChange={(e) => window.location.href = e.target.value}
            >
              {navItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.icon} {item.label}
                </option>
              ))}
            </select>
            
            {/* Mobile Logout Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};