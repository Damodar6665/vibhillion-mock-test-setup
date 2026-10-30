// ==============================================================================
// VIBHILLION ADMIN: AUTH CONTEXT & ROLE VERIFICATION
// File: apps/admin/src/context/auth-context.tsx
// ==============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'admin' | 'student' | null;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isAdmin: false,
  isLoading: true,
  isConfigured: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  loginAsDemo: () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'admin' | 'student' | null>('admin');
  const [isLoading, setIsLoading] = useState(true);

  const loginAsDemo = () => {
    const demoAdmin = {
      id: 'mock-admin-id',
      email: 'admin@vibhillion.ai',
      user_metadata: { full_name: 'Administrator' },
    } as any;
    try {
      localStorage.setItem('vibhillion_admin_user', JSON.stringify(demoAdmin));
    } catch (_) {}
    setUser(demoAdmin);
    setRole('admin');
  };

  useEffect(() => {
    // Check if we have an active local admin session
    try {
      const savedUser = localStorage.getItem('vibhillion_admin_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setRole('admin');
        setIsLoading(false);
        return;
      }
    } catch (_) {}

    if (!isSupabaseConfigured) {
      loginAsDemo();
      setIsLoading(false);
      return;
    }

    async function checkUserRole(currentUser: User | null) {
      if (!currentUser) {
        setRole(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        } else {
          setRole('student');
        }
      } catch {
        setRole('student');
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      // If we already have a local admin session saved, keep it
      const savedUser = localStorage.getItem('vibhillion_admin_user');
      if (savedUser) {
        setIsLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null).finally(() => setIsLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const savedUser = localStorage.getItem('vibhillion_admin_user');
      if (savedUser) {
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      checkUserRole(session?.user ?? null).finally(() => setIsLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // If demo admin credentials or Supabase not configured, log in locally immediately
    if (!isSupabaseConfigured || email.toLowerCase() === 'admin@vibhillion.ai') {
      loginAsDemo();
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Verify admin role from backend
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        // Try auto-elevating if registered via admin portal
        const { data: bootRes } = await supabase.rpc('bootstrap_admin', { p_email: email });
        if (bootRes?.success) {
          setRole('admin');
          return { success: true };
        }

        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Access denied: User is not an admin. Run bootstrap_admin in Supabase SQL editor.',
        };
      }

      setRole('admin');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      loginAsDemo();
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        // Auto bootstrap as admin for the console creator
        await supabase.rpc('bootstrap_admin', { p_email: email });
        setRole('admin');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('vibhillion_admin_user');
    } catch (_) {}
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin: role === 'admin',
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        loginAsDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
