import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducers/authSlice';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      store.dispatch(logout());
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

