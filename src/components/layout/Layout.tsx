import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { AppFooter } from './AppFooter';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex flex-col">
      <Navigation />
      <main className="container mx-auto max-w-[1300px] px-3 sm:px-4 py-4 sm:py-8 flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};