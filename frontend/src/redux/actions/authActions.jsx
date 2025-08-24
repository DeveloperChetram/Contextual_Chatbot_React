// frontend/src/redux/actions/authActions.jsx
import axios from "../../api/axios";
import {
  registerRequest,
  registerSuccess,
  registerFailure,
  loginRequest,
  loginFailure,
} from "../reducers/authSlice";

export const getCurrenctUser = ()=>{
  const isUser = localStorage.getItem('isLoggedIn')
  console.log("isUser",isUser)
}
export const registerUserAction = (data) => async (dispatch) => {
  dispatch(registerRequest());

  try {
    const result = await axios.post("/auth/register", data);
    
    console.log("result from action ", result);
    dispatch(registerSuccess(result.data.user)); 
      localStorage.setItem('isLoggedIn', true)
  } catch (error) {
    dispatch(
      registerFailure(
        error.response?.data?.message || error.message || "Something went wrong"
      )
    );
    return error;
  }
};

export const loginUserAction = (data) => async (dispatch) => {
  dispatch(loginRequest());

  try {
    const result = await axios.post("/auth/login", data);
    
    console.log("result from action for login ", result);
    dispatch(registerSuccess(result.data.user)); 
    localStorage.setItem('isLoggedIn', true)
  } catch (error) {
    dispatch(
      loginFailure(
        error.response?.data?.message || error.message || "Something went wrong"
      )
    );
    return error;
  }
};
