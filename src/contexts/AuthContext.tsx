import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/integrations/api/client';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthProfile {
  id: string;
  user_id: string;
  role: 'admin' | 'patient' | 'hr_admin';
  full_name: string;
  ic_number?: string;
  phone_number?: string;
  company_id?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { accessToken: string } | null;
  profile: AuthProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isHRAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, icNumber?: string, phoneNumber?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  createHRAdmin: (email: string, password: string, fullName: string, companyId: string) => Promise<{ error: any }>;
  deleteUser: (userId: string) => Promise<{ error: any }>;
  changeUserPassword: (userId: string, newPassword: string) => Promise<{ error: any }>;
  changeUserEmail: (userId: string, newEmail: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ accessToken: string } | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedSession = localStorage.getItem('razi_auth_session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          setSession({ accessToken: parsed.accessToken });
          setUser(parsed.user);

          const userProfile = await api.profiles.getByUserId(parsed.user.id);
          setProfile(userProfile as AuthProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('razi_auth_session');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, icNumber?: string, phoneNumber?: string) => {
    try {
      const result = await api.auth.signUp(email, password, fullName, icNumber, phoneNumber);
      if (result.error) return { error: result.error };

      const signInResult = await api.auth.signIn(email, password);
      if (signInResult.error) return { error: signInResult.error };

      localStorage.setItem('razi_auth_session', JSON.stringify({
        user: signInResult.user,
        accessToken: signInResult.accessToken,
      }));

      setUser(signInResult.user);
      setSession({ accessToken: signInResult.accessToken });

      const userProfile = await api.profiles.getByUserId(signInResult.user.id);
      setProfile(userProfile as AuthProfile);

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await api.auth.signIn(email, password);
      if (result.error) return { error: result.error };

      localStorage.setItem('razi_auth_session', JSON.stringify({
        user: result.user,
        accessToken: result.accessToken,
      }));

      setUser(result.user);
      setSession({ accessToken: result.accessToken });

      const userProfile = await api.profiles.getByUserId(result.user.id);
      setProfile(userProfile as AuthProfile);

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const signOut = async () => {
    try {
      await api.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('razi_auth_session');
      setUser(null);
      setSession(null);
      setProfile(null);
      window.location.href = '/';
    }
  };

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      await api.profiles.update(user.id, updates);
      const userProfile = await api.profiles.getByUserId(user.id);
      setProfile(userProfile as AuthProfile);
      return { error: null };
    } catch (error: any) {
      return { error: new Error(error.message) };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const userProfile = await api.profiles.getByUserId(user.id);
      setProfile(userProfile as AuthProfile);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const createHRAdmin = async (email: string, password: string, fullName: string, companyId: string) => {
    return { error: new Error('Not implemented') };
  };

  const deleteUser = async (userId: string) => {
    return { error: new Error('Not implemented') };
  };

  const changeUserPassword = async (userId: string, newPassword: string) => {
    return { error: new Error('Not implemented') };
  };

  const changeUserEmail = async (userId: string, newEmail: string) => {
    return { error: new Error('Not implemented') };
  };

  const isAdmin = profile?.role === 'admin';
  const isHRAdmin = profile?.role === 'hr_admin';

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    isHRAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    createHRAdmin,
    deleteUser,
    changeUserPassword,
    changeUserEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};