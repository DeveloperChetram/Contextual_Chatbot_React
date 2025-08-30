import { axiosInstance as axios } from "../../api/axios";
import {
  registerRequest,
  registerSuccess,
  registerFailure,
  loginRequest,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "../reducers/authSlice";
import { clearChatStore } from "../reducers/chatSlice";


export const registerUser = async (dispatch, data) => {
  dispatch(registerRequest());
  try {
    const response = await axios.post("/auth/register", data);
    dispatch(registerSuccess(response.data.user));
    dispatch(clearChatStore()); // Clear any existing chat data for new user
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    dispatch(registerFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};


export const loginUser = async (dispatch, data) => {
  dispatch(loginRequest());
  try {
    const response = await axios.post("/auth/login", data);
    dispatch(loginSuccess(response.data.user));
    dispatch(clearChatStore()); // Clear any existing chat data for new user
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = ()=>async (dispatch) => {
  try {
    await axios.get('/auth/logout');
    dispatch(logoutAction());
    dispatch(clearChatStore()); // Clear chat store when user logs out
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error("Logout failed", error);
    dispatch(logoutAction());
    dispatch(clearChatStore()); // Clear chat store even if logout request fails
    localStorage.removeItem('user');
    return { success: false, error };
  }
};