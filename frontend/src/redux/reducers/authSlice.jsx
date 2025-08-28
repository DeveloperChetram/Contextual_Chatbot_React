// frontend/src/redux/reducers/authSlice.jsx
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    registerRequest(state) {
        state.loading = true;
        state.error = null;
    },
    registerSuccess(state, action) {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
    },
    registerFailure(state, action) {
        state.loading = false;
        state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    // New reducer to set the user from localStorage
    setUserFromStorage(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    // Reset loading and error state
    resetAuthState(state) {
      state.loading = false;
      state.error = null;
    }
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,    
  registerSuccess,    
  registerFailure,    
  logout,
  setUserFromStorage,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;