import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from Firebase auth or use demo token
    try {
      const { auth, isFirebaseConfigured } = await import('./firebase');
      if (isFirebaseConfigured() && auth) {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // Demo mode: use demo token
        config.headers.Authorization = `Bearer demo-token-123`;
      }
    } catch (error) {
      // Fallback to demo token if Firebase fails
      config.headers.Authorization = `Bearer demo-token-123`;
      console.warn('Using demo token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

