import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from './axios';

/**
 * Typed API Client wrapper around the central axios instance.
 * Automatically unwraps the nested response structures 
 * handled by the interceptor.
 */
export const apiClient = {
  get: async <T>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, { ...config, params });
    return response.data;
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  del: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};
