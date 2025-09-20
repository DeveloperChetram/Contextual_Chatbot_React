import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducers/authSlice';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api",
  withCredentials: true,
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

