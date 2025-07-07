import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { AdminPanel } from "./pages/AdminPanel";
import { StaffSearch } from "./pages/StaffSearch";
import { StaffList } from "./pages/StaffList";
import { Companies } from "./pages/Companies";
import { Reports } from "./pages/Reports";
import { Auth } from "./pages/Auth";
import { PatientDashboard } from "./pages/PatientDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in but not admin, redirect to patient dashboard
  if (user && profile?.role === 'patient') {
    return <PatientDashboard />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/patient" element={<PatientDashboard />} />
      <Route path="/" element={
        <ProtectedRoute adminOnly>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="staff" element={<StaffSearch />} />
        <Route path="staff-list" element={<StaffList />} />
        <Route path="companies" element={<Companies />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
