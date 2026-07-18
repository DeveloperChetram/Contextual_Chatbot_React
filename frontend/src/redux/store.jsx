import { configureStore } from '@reduxjs/toolkit';
import authSlice from './reducers/authSlice';
import chatSlice from './reducers/chatSlice';
import customCharacterReducer from './reducers/customCharacterSlice';
import memoryReducer from './reducers/memorySlice';
import agentReducer from './reducers/agentSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    customCharacters: customCharacterReducer,
    memory: memoryReducer,
    agent: agentReducer,
  },
});

export default store;