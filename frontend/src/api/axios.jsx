import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/reducers/authSlice';

// ── Backend URL ─────────────────────────────────────────────────────────────
// Production: use Vercel proxy (/api → Render). Same-origin = no CORS issues.
// Local: connect to the local backend server.
const BACKEND_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')
      : `http://${window.location.hostname}:3000/api`);

export const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// ── Inject JWT into every request ──────────────────────────────────────────
// Vercel strips Authorization and Cookie headers when proxying to external
// destinations, so we send the token via multiple channels:
//   1. Authorization header (standard, works for direct connections)
//   2. x-auth-token header (custom — Vercel typically forwards unknown headers)
//   3. Query parameter ?token= (always forwarded by Vercel)
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
      config.params = { ...config.params, token };
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

