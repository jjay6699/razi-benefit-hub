import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ScrollToTop } from "./components/ScrollToTop";
import { Dashboard } from "./pages/Dashboard";
import { AdminPanel } from "./pages/AdminPanel";
import { StaffSearch } from "./pages/StaffSearch";
import { StaffList } from "./pages/StaffList";
import { EmployeeDetail } from "./pages/EmployeeDetail";
import { Companies } from "./pages/Companies";
import { Reports } from "./pages/Reports";
import { Auth } from "./pages/Auth";
import { PatientDashboard } from "./pages/PatientDashboard";
import { HRAdminDashboard } from "./pages/HRAdminDashboard";
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

  return (
    <Routes>
      {/* Root route - redirects based on authentication status */}
      <Route path="/" element={
        !user ? (
          <Auth />
        ) : !profile ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile.role === 'admin' ? (
          <Navigate to="/dashboard" replace />
        ) : profile.role === 'hr_admin' ? (
          <Navigate to="/hr-admin" replace />
        ) : (
          <Navigate to="/patient" replace />
        )
      } />
      
      {/* Auth page */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Patient dashboard */}
      <Route path="/patient" element={
        <ProtectedRoute>
          <PatientDashboard />
        </ProtectedRoute>
      } />

      {/* HR Admin dashboard */}
      <Route path="/hr-admin" element={
        <ProtectedRoute hrAdminOnly>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<HRAdminDashboard />} />
      </Route>
      
      {/* Admin dashboard and routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute adminOnly>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="admin" element={<AdminPanel />} />
        <Route path="staff" element={<StaffSearch />} />
        <Route path="staff-list" element={<StaffList />} />
        <Route path="employee/:employeeId" element={<EmployeeDetail />} />
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
          <ScrollToTop />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
