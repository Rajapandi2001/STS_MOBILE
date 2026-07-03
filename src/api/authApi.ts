import apiClient from './apiClient';

export interface UserProfile {
  userID: number;
  userName: string;
  displayName: string;
  empID: number;
  groupID: number;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  token?: string;
  expires?: string;
  user?: UserProfile;
}

export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/Auth/login',
      null,
      {
        params: {
          userName: username,
          password: password,
        },
      }
    );
    return response.data;
  },
};