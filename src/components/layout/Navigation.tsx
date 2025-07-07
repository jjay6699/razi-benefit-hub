import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/admin', label: 'Admin Panel', icon: '⚙️' },
  { path: '/staff', label: 'Staff Search', icon: '🔍' },
  { path: '/staff-list', label: 'Staff List', icon: '👥' },
  { path: '/companies', label: 'Companies', icon: '🏢' },
  { path: '/reports', label: 'Reports', icon: '📈' },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto max-w-[1300px] px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">
              AR RAZI MEDICAL BENEFIT SYSTEM
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
          </nav>

          {/* Mobile Navigation */}
          <div className="md:hidden">
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
          </div>
        </div>
      </div>
    </header>
  );
};