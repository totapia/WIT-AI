import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'agent';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string; // Added password to the User interface
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  const login = async (email: string, password: string) => {
    // Mock login - replace with actual authentication
    const mockUsers = {
      'admin@company.com': { 
        id: '1', 
        name: 'Admin User', 
        email: 'admin@company.com', 
        role: 'admin' as UserRole,
        password: 'admin123'
      },
      'manager@company.com': { 
        id: '2', 
        name: 'Manager User', 
        email: 'manager@company.com', 
        role: 'manager' as UserRole,
        password: 'manager123'
      },
      'agent@company.com': { 
        id: '3', 
        name: 'Agent User', 
        email: 'agent@company.com', 
        role: 'agent' as UserRole,
        password: 'agent123'
      }
    };

    const userData = mockUsers[email as keyof typeof mockUsers];
    if (userData && password === userData.password) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </UserContext.Provider>
  );
};
