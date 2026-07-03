import axios from 'axios';
import { storageService } from '../services/storageService';

const apiClient = axios.create({
  baseURL: 'http://smartdigitalbuild360.com:91/STSMobileAPI/api',
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;