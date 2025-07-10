import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  role: 'admin' | 'patient' | 'hr_admin';
  full_name: string;
  ic_number?: string;
  phone_number?: string;
  company_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  isHRAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, icNumber?: string, phoneNumber?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Don't set loading to false yet - wait for profile to load
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      setProfile(data || null);
      setLoading(false); // Set loading to false after profile is loaded
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, icNumber?: string, phoneNumber?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) return { error };
      if (!data.user) return { error: new Error('No user returned') };

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          full_name: fullName,
          ic_number: icNumber || null,
          phone_number: phoneNumber || null,
          role: 'patient' // Default role
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { error: profileError };
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase and clear all stored auth data
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear any localStorage data manually as backup
      localStorage.clear();
      
      // Force redirect to home/auth page
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await fetchUserProfile(user.id);
  };

  const createHRAdmin = async (email: string, password: string, fullName: string, companyId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-hr-admin', {
        body: {
          email,
          password,
          fullName,
          companyId
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        return { error };
      }

      if (data?.error) {
        return { error: new Error(data.error) };
      }

      return { error: null };
    } catch (error) {
      console.error('Network error:', error);
      return { error };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'delete',
          userId
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const changeUserPassword = async (userId: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'update_password',
          userId,
          password: newPassword
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const changeUserEmail = async (userId: string, newEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'update_email',
          userId,
          email: newEmail
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return { error: null };
    } catch (error) {
      return { error };
    }
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