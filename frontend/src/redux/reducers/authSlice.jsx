import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  token: localStorage.getItem('token') || null,
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
      // state.user = action.payload;
     const incomingUser = action.payload.user || action.payload;
      const incomingToken = action.payload.token || incomingUser?.token || localStorage.getItem('token');
      state.user = incomingUser;
      state.token = incomingToken;
      if (incomingToken) {
        localStorage.setItem('token', incomingToken);
      }
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
      const incomingUser = action.payload.user || action.payload;
        const incomingToken = action.payload.token || incomingUser?.token || localStorage.getItem('token');

        state.user = incomingUser;
        state.token = incomingToken;

        if (incomingToken) {
          localStorage.setItem('token', incomingToken);
        }
    },
    registerFailure(state, action) {
        state.loading = false;
        state.error = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
    localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    setUserFromStorage(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.token = action.payload.token || localStorage.getItem('token');
    },
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