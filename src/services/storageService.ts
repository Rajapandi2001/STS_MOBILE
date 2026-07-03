import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_profile';

export const storageService = {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in storage:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token from storage:', error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from storage:', error);
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user profile in storage:', error);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user profile from storage:', error);
      return null;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user profile from storage:', error);
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.error('Error clearing auth data from storage:', error);
    }
  },
};