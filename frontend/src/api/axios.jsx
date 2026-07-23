import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducers/authSlice';

// ── Backend URL ─────────────────────────────────────────────────────────────
// Production: connect DIRECTLY to Render (Vercel strips auth headers/cookies).
// Local: connect to the local backend server.
const BACKEND_URL = import.meta.env.PROD
  ? 'https://contextual-chatbot-react.onrender.com/api'
  : (import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000/api`);

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// ── Inject JWT into every request (second line of defence) ──────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auto-logout on 401 / 404 ────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      if (!error.config.url.includes('/credits')) {
        store.dispatch(logout());
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

