import axios, { type AxiosInstance, type AxiosError } from 'axios';

// FIXED: Force cache bust - Use environment variable or default to /api for development proxy
// In development: /api goes through Vite proxy to http://localhost:5001
// In production: should be set to full API URL (e.g., https://api.hanyanghars.com/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
console.log('[API CONFIG] Base URL:', API_BASE_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
