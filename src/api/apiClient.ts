import axios, { InternalAxiosRequestConfig } from 'axios';
import { storageService, DEFAULT_BASE_URL } from '../services/storageService';

const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const customBaseUrl = await storageService.getBaseUrl();
    if (customBaseUrl) {
      config.baseURL = customBaseUrl;
    }
    const token = await storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export default apiClient;
