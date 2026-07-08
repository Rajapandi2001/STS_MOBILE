import axios, { InternalAxiosRequestConfig } from 'axios';
import { storageService, DEFAULT_BASE_URL } from '../services/storageService';

type UnauthorizedCallback = () => void;
let unauthorizedCallback: UnauthorizedCallback | null = null;

export const registerUnauthorizedCallback = (callback: UnauthorizedCallback) => {
  unauthorizedCallback = callback;
};

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config && error.config.url && error.config.url.includes('/Auth/login');
      if (!isLoginRequest && unauthorizedCallback) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;