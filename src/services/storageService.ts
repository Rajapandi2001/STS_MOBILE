import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_profile';
const BASE_URL_KEY = 'api_base_url';
const EXPIRE_DATE_KEY = 'auth_expire_date';
const USER_ID_KEY = 'auth_user_id';
const USER_NAME_KEY = 'auth_user_name';
const DISPLAY_NAME_KEY = 'auth_display_name';
const GROUP_ID_KEY = 'auth_group_id';
const EMP_ID_KEY = 'auth_emp_id';

export const DEFAULT_BASE_URL = 'http://smartdigitalbuild360.com:91/STSMobileAPI/api';

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

  async setExpireDate(expireDate: string): Promise<void> {
    try {
      await AsyncStorage.setItem(EXPIRE_DATE_KEY, expireDate);
    } catch (error) {
      console.error('Error setting expire date in storage:', error);
    }
  },

  async getExpireDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(EXPIRE_DATE_KEY);
    } catch (error) {
      console.error('Error getting expire date from storage:', error);
      return null;
    }
  },

  async setUserID(userID: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, userID);
    } catch (error) {
      console.error('Error setting userID in storage:', error);
    }
  },

  async getUserID(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('Error getting userID from storage:', error);
      return null;
    }
  },

  async setUserName(userName: string): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, userName);
    } catch (error) {
      console.error('Error setting userName in storage:', error);
    }
  },

  async getUserName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_NAME_KEY);
    } catch (error) {
      console.error('Error getting userName from storage:', error);
      return null;
    }
  },

  async setDisplayName(displayName: string): Promise<void> {
    try {
      await AsyncStorage.setItem(DISPLAY_NAME_KEY, displayName);
    } catch (error) {
      console.error('Error setting displayName in storage:', error);
    }
  },

  async getDisplayName(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(DISPLAY_NAME_KEY);
    } catch (error) {
      console.error('Error getting displayName from storage:', error);
      return null;
    }
  },

  async setGroupID(groupID: string): Promise<void> {
    try {
      await AsyncStorage.setItem(GROUP_ID_KEY, groupID);
    } catch (error) {
      console.error('Error setting groupID in storage:', error);
    }
  },

  async getGroupID(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(GROUP_ID_KEY);
    } catch (error) {
      console.error('Error getting groupID from storage:', error);
      return null;
    }
  },

  async setEmpID(empID: string): Promise<void> {
    try {
      await AsyncStorage.setItem(EMP_ID_KEY, empID);
    } catch (error) {
      console.error('Error setting empID in storage:', error);
    }
  },

  async getEmpID(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(EMP_ID_KEY);
    } catch (error) {
      console.error('Error getting empID from storage:', error);
      return null;
    }
  },

  async getBaseUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(BASE_URL_KEY);
    } catch (error) {
      console.error('Error getting base URL from storage:', error);
      return null;
    }
  },

  async setBaseUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(BASE_URL_KEY, url);
    } catch (error) {
      console.error('Error setting base URL in storage:', error);
    }
  },

  async removeBaseUrl(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BASE_URL_KEY);
    } catch (error) {
      console.error('Error removing base URL from storage:', error);
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        TOKEN_KEY,
        USER_KEY,
        EXPIRE_DATE_KEY,
        USER_ID_KEY,
        USER_NAME_KEY,
        DISPLAY_NAME_KEY,
        GROUP_ID_KEY,
        EMP_ID_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing auth data from storage:', error);
    }
  },
};