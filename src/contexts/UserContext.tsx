import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'manager' | 'agent';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Role-based permissions
const rolePermissions = {
  admin: ['dashboard', 'reports', 'call-dashboard', 'email-agent', 'training', 'directory'],
  manager: ['dashboard', 'reports', 'call-dashboard', 'email-agent', 'training', 'directory'],
  agent: ['dashboard', 'call-dashboard', 'email-agent', 'training', 'directory']
};

// Role mapping by email
const roleMapping = {
  'admin@company.com': 'admin' as UserRole,
  'agent@company.com': 'agent' as UserRole,
  'manager@company.com': 'manager' as UserRole
};

// Helper function to create user profile from auth user
const createUserProfile = (authUser: SupabaseUser): User => {
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: roleMapping[authUser.email as keyof typeof roleMapping] || 'agent'
  };
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      console.log('UserContext: Starting login...');
      setLoading(true);
      
      // Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      console.log('Supabase auth successful, creating user profile...');

      // Create user profile from auth data
      const userProfile = createUserProfile(data.user);

      setUser(userProfile);
      setSession(data.session);
      
      console.log('UserContext: Login complete');
      
    } catch (error) {
      console.error('UserContext: Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Note: User will need to confirm email before they can login
        throw new Error('Please check your email to confirm your account before signing in.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          // Create user profile directly from auth user - no database call
          const userProfile = createUserProfile(session.user);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Create user profile directly from auth user - no database call
          const userProfile = createUserProfile(session.user);
          setUser(userProfile);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      session, 
      loading, 
      login, 
      signup, 
      logout, 
      hasPermission 
    }}>
      {children}
    </UserContext.Provider>
  );
};
