// frontend/src/lib/auth.ts
'use client'; // Required for createContext, useContext, useState, useEffect

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for persisted auth state (simple mock)
    // This effect should only run on the client side.
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('proppilot_auth');
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          if (authData && typeof authData.isAuthenticated === 'boolean' && typeof authData.userName === 'string') {
            setIsAuthenticated(authData.isAuthenticated);
            setUserName(authData.userName);
          } else {
            // Clear invalid data
            localStorage.removeItem('proppilot_auth');
          }
        } catch (error) {
          console.error("Failed to parse auth data from localStorage", error);
          localStorage.removeItem('proppilot_auth');
        }
      }
    }
  }, []);

  const login = (name: string) => {
    if (typeof window !== 'undefined') {
      const authData = { isAuthenticated: true, userName: name };
      localStorage.setItem('proppilot_auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUserName(name);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('proppilot_auth');
      setIsAuthenticated(false);
      setUserName(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
