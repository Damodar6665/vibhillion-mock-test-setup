import { jsx as _jsx } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: AUTH CONTEXT & ROLE VERIFICATION
// File: apps/admin/src/context/auth-context.tsx
// ==============================================================================
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
const AuthContext = createContext({
    user: null,
    session: null,
    role: null,
    isAdmin: false,
    isLoading: true,
    isConfigured: false,
    signIn: async () => ({ success: false }),
    signOut: async () => { },
});
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [role, setRole] = useState('admin');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!isSupabaseConfigured) {
            // In local demo mode, default to authenticated admin for immediate inspection
            setUser({
                id: 'mock-admin-id',
                email: 'admin@vibhillion.ai',
                user_metadata: { full_name: 'Administrator' },
            });
            setRole('admin');
            setIsLoading(false);
            return;
        }
        async function checkUserRole(currentUser) {
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
                }
                else {
                    setRole('student');
                }
            }
            catch {
                setRole('student');
            }
        }
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkUserRole(session?.user ?? null).finally(() => setIsLoading(false));
        });
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            checkUserRole(session?.user ?? null).finally(() => setIsLoading(false));
        });
        return () => subscription.unsubscribe();
    }, []);
    const signIn = async (email, password) => {
        if (!isSupabaseConfigured) {
            setUser({
                id: 'mock-admin-id',
                email,
                user_metadata: { full_name: 'Admin' },
            });
            setRole('admin');
            return { success: true };
        }
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                return { success: false, error: error.message };
            // Verify admin role from backend
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();
            if (profile?.role !== 'admin') {
                await supabase.auth.signOut();
                return {
                    success: false,
                    error: 'Access denied: You must have an administrator role to log into the Admin portal.',
                };
            }
            setRole('admin');
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message || 'Login failed' };
        }
    };
    const signOut = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSession(null);
        setRole(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            session,
            role,
            isAdmin: role === 'admin',
            isLoading,
            isConfigured: isSupabaseConfigured,
            signIn,
            signOut,
        }, children: children }));
};
export const useAuth = () => useContext(AuthContext);
