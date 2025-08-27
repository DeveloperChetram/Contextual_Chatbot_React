// frontend/src/api/axios.jsx
import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducers/authSlice';

// import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});
// intercepters
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

