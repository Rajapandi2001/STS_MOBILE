import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserProfile } from '../api/authApi';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, forceOffline?: boolean) => Promise<{ success: boolean; message: string; user?: UserProfile; isNetworkError?: boolean }>;
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

  const login = async (username: string, password: string, forceOffline: boolean = false) => {
    const is_manager = username.trim().toLowerCase() === 'manager';
    if (is_manager) {
      const mockUser: UserProfile = {
        userID: 3,
        userName: 'manager',
        displayName: 'Lingesvaran',
        empID: 102,
        groupID: 3,
      };
      await storageService.setToken('mock_jwt_token_for_manager');
      await storageService.setUser(mockUser);
      setToken('mock_jwt_token_for_manager');
      setUser(mockUser);
      return { success: true, message: 'Logged in as Manager (Demo)', user: mockUser };
    }

    if (forceOffline) {
      const is_admin = username.trim().toLowerCase() === 'admin';
      const mockUser: UserProfile = {
        userID: is_admin ? 1 : 2,
        userName: username.trim() || 'demo_user',
        displayName: is_admin ? 'ADMIN' : 'Demo Employee',
        empID: is_admin ? 100 : 101,
        groupID: is_admin ? 5 : 1,
      };
      await storageService.setToken('mock_jwt_token_for_testing');
      await storageService.setUser(mockUser);
      setToken('mock_jwt_token_for_testing');
      setUser(mockUser);
      return { success: true, message: 'Logged in via Offline Demo Mode', user: mockUser };
    }
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
      console.log('Login error in Context:', err);
      const isNetworkError = !err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK';
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected login error occurred.';
      return { success: false, message: errorMessage, isNetworkError };
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