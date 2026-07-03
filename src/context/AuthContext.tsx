import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserProfile } from '../api/authApi';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from storage on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken = await storageService.getToken();
        const storedUser = await storageService.getUser();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      if (response.status && response.token && response.user) {
        await storageService.setToken(response.token);
        await storageService.setUser(response.user);
        setToken(response.token);
        setUser(response.user);
        return { success: true, message: response.message || 'Login Successful', user: response.user };
      } else {
        return { success: false, message: response.message || 'Login failed. Invalid response status.' };
      }
    } catch (err: any) {
      console.error('Login error in Context:', err);
      // Try to parse error from backend response
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected login error occurred.';
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await storageService.clearAuthData();
    } catch (e) {
      console.error('Failed to clear auth data during logout:', e);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
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