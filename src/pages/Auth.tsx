import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Shield, User } from 'lucide-react';

export const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('patient-login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  // Redirect if already authenticated
  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for specific admin credentials
    if (email === 'admin1214' && password === 'l<m@B*W?26F4') {
      // Use the admin email for Supabase authentication
      const { error } = await signIn('admin1214@admin.com', password);
      if (error) {
        setError(error.message);
        toast({
          title: "Admin Login Failed",
          description: "Please check your credentials.",
          variant: "destructive",
        });
      } else {
        // Force redirect to admin dashboard
        window.location.href = '/dashboard';
      }
    } else {
      setError('Invalid admin credentials. Only authorized administrators can access this section.');
      toast({
        title: "Access Denied",
        description: "Invalid admin credentials. Only authorized administrators can access this section.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Force redirect to patient dashboard
      window.location.href = '/patient';
    }
    
    setLoading(false);
  };

  const handlePatientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!fullName.trim() || !icNumber.trim() || !phoneNumber.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName.trim(), icNumber.trim(), phoneNumber.trim());
    if (error) {
      setError(error.message);
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setIcNumber('');
    setPhoneNumber('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">AR RAZI MEDICAL</h1>
          <p className="text-muted-foreground">Access your medical benefit account</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); resetForm(); }}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="patient-login" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Patient Login
            </TabsTrigger>
            <TabsTrigger value="admin-login" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
            <TabsTrigger value="patient-signup">Sign Up</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Patient Login */}
          <TabsContent value="patient-login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="patient-email">Email</Label>
                    <Input
                      id="patient-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="patient-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Login */}
          <TabsContent value="admin-login">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">Username</Label>
                    <Input
                      id="admin-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Admin Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Sign Up */}
          <TabsContent value="patient-signup">
            <Card>
              <CardHeader>
                <CardTitle>Patient Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientSignUp} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-fullname">Full Name (as per IC) *</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-ic">IC Number *</Label>
                    <Input
                      id="signup-ic"
                      type="text"
                      value={icNumber}
                      onChange={(e) => setIcNumber(e.target.value)}
                      placeholder="e.g., 123456-78-9012"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-phone">Phone Number *</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., +60123456789"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};