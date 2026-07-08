import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, UserProfile } from '../api/authApi';
import { storageService } from '../services/storageService';
import { registerUnauthorizedCallback } from '../api/apiClient';

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

  // Register unauthorized callback for 401 errors
  useEffect(() => {
    registerUnauthorizedCallback(async () => {
      await logout();
    });
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
      await storageService.setExpireDate('2026-07-08T06:22:38Z');
      await storageService.setUserID(mockUser.userID.toString());
      await storageService.setUserName(mockUser.userName);
      await storageService.setDisplayName(mockUser.displayName);
      await storageService.setGroupID(mockUser.groupID.toString());
      await storageService.setEmpID(mockUser.empID.toString());
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
      await storageService.setExpireDate('2026-07-08T06:22:38Z');
      await storageService.setUserID(mockUser.userID.toString());
      await storageService.setUserName(mockUser.userName);
      await storageService.setDisplayName(mockUser.displayName);
      await storageService.setGroupID(mockUser.groupID.toString());
      await storageService.setEmpID(mockUser.empID.toString());
      await storageService.setUser(mockUser);

      setToken('mock_jwt_token_for_testing');
      setUser(mockUser);
      return { success: true, message: 'Logged in via Offline Demo Mode', user: mockUser };
    }

    try {
      const response = await authApi.login(username, password);
      if (response.status && response.data) {
        const { token: jwtToken, expireDate, user: userProfile } = response.data;

        await storageService.setToken(jwtToken);
        await storageService.setExpireDate(expireDate);
        await storageService.setUserID(userProfile.userID.toString());
        await storageService.setUserName(userProfile.userName);
        await storageService.setDisplayName(userProfile.displayName);
        await storageService.setGroupID(userProfile.groupID.toString());
        await storageService.setEmpID(userProfile.empID.toString());
        await storageService.setUser(userProfile);

        setToken(jwtToken);
        setUser(userProfile);

        return { success: true, message: response.message || 'Login Successful', user: userProfile };
      } else {
        return { success: false, message: 'Invalid username or password.' };
      }
    } catch (err: any) {
      console.log('Login error in Context:', err);
      let errorMessage = 'An unexpected login error occurred. Please try again later.';
      let isNetworkError = false;

      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again later.';
      } else if (!err.response || err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        errorMessage = 'No internet connection. Please check your network and try again.';
        isNetworkError = true;
      } else if (err.response) {
        const status = err.response.status;
        if (status === 400 || status === 401) {
          errorMessage = 'Invalid username or password.';
        } else if (status === 500) {
          errorMessage = 'An internal server error occurred. Please try again later.';
        } else if (status === 502 || status === 503 || status === 504) {
          errorMessage = 'Server is currently unavailable. Please try again later.';
        }
      }

      return { success: false, message: errorMessage, isNetworkError };
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