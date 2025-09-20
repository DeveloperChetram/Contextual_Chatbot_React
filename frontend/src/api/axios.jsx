import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducers/authSlice';

// Debug environment variables in production
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";
console.log('Environment:', import.meta.env.MODE);
console.log('Backend URL:', BACKEND_URL);
console.log('All env vars:', import.meta.env);

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      // Don't logout for credits endpoint as it's used for token validation
      if (!error.config.url.includes('/credits')) {
        store.dispatch(logout());
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

