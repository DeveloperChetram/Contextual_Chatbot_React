import { configureStore } from '@reduxjs/toolkit';
import authSlice from './reducers/authSlice';
import chatSlice from './reducers/chatSlice';

const store = configureStore({
  reducer: {
   auth:authSlice,
   chat:chatSlice
},
});

export default store;