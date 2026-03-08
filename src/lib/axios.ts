import axios, { AxiosError, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/store/authStore';

// Response format from backend
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Unwrap standard BE response format: { success, data, meta }
    const { data, meta } = response.data;
    
    // Pass meta through as a custom header if it exists
    if (meta) {
      response.headers['x-meta'] = JSON.stringify(meta);
    }
    
    // Replace the entire response data with the unwrapped payload
    response.data = data as any;
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Network errors (no response)
    if (!error.response) {
      message.error('Cannot connect to server');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        // Unauthorized
        message.warning('Session expired, please log in again', 3);
        useAuthStore.getState().logout();
        setTimeout(() => {
          window.location.href = '/login'; // Prevent circular router imports after message resolves
        }, 1000);
        break;

      case 403:
        // Forbidden
        message.error('You do not have permission');
        break;

      case 409:
        // Conflict
        if (data?.error?.message) {
          // Throw specific error to be caught by the caller
          return Promise.reject(new Error(data.error.message));
        }
        break;

      case 400:
      case 422:
        // Validation Errors
        if (data?.error?.details) {
          return Promise.reject({
            message: data.error.message || 'Validation failed',
            details: data.error.details,
          });
        }
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        message.error('Server error, please try again');
        console.error('[API Server Error]:', error);
        break;

      default:
        // Optional default handler if needed
        break;
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
