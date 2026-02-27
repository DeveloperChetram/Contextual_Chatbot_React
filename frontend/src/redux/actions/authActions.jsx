import { axiosInstance as axios } from '../../api/axios.jsx';
import {
  registerRequest,
  registerSuccess,
  registerFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from '../reducers/authSlice';
import { clearChatStore } from '../reducers/chatSlice';

export const registerUser = async (dispatch, data) => {
  dispatch(registerRequest());
  try {
    const response = await axios.post('/auth/register', data);
    dispatch(registerSuccess(response.data.user));
    dispatch(clearChatStore());
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    dispatch(registerFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (dispatch, data) => {
  dispatch(loginRequest());
  try {
    const response = await axios.post('/auth/login', data);
    dispatch(loginSuccess(response.data.user));
    dispatch(clearChatStore());
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // FLAW-06 fix: logout uses POST (not GET)
    await axios.post('/auth/logout');
  } catch (error) {
    // Silent fail — clear local state regardless
  } finally {
    dispatch(logoutAction());
    dispatch(clearChatStore());
    localStorage.removeItem('user');
  }
  return { success: true };
};

/**
 * FLAW-04 fix: Uses /auth/me endpoint for proper session validation.
 * Gets fresh user data from DB instead of relying on stale localStorage.
 */
export const getCurrentUser = async (dispatch) => {
  try {
    const response = await axios.get('/auth/me');
    dispatch(loginSuccess(response.data.user));
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { success: true };
  } catch (error) {
    // Token is invalid or expired
    dispatch(logoutAction());
    localStorage.removeItem('user');
    return { success: false, error };
  }
};