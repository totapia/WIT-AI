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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user profile from users_login table
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users_login')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.full_name || data.email?.split('@')[0] || 'User',
        email: data.email,
        role: data.role || 'agent'
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        const userProfile = await getUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          setSession(data.session);
        } else {
          // If no profile exists, create a default one
          const defaultUser: User = {
            id: data.user.id,
            name: data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: 'agent'
          };
          setUser(defaultUser);
          setSession(data.session);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
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
        // Update the user record with the full_name and role
        const { error: updateError } = await supabase
          .from('users_login')
          .update({
            full_name: name,
            role: 'agent' // Default role
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating user profile:', updateError);
        }

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
          const userProfile = await getUserProfile(session.user.id);
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
          const userProfile = await getUserProfile(session.user.id);
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
