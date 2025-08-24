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


export const registerUser = async (dispatch, data) => {
  dispatch(registerRequest());
  try {
    const response = await axios.post("/auth/register", data);
    dispatch(registerSuccess(response.data.user));
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
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
    dispatch(loginFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async (dispatch) => {
  try {
    await axios.get('/auth/logout');
    dispatch(logoutAction());
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error("Logout failed", error);
    dispatch(logoutAction());
    localStorage.removeItem('user');
    return { success: false, error };
  }
};