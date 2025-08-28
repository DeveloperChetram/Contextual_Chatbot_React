import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  allMessages: [], // Changed from 'messages: {}' to 'allMessages: []'
  activeChatId: null,
  loading: false,
  error: null,
  isModelTyping: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload);
    },
    setAllMessages: (state, action) => { // New reducer for all messages
      state.allMessages = action.payload;
    },
    addMessage: (state, action) => {
      state.allMessages.push(action.payload.message);
    },
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
    },
    setModelTyping: (state, action) => {
      state.isModelTyping[action.payload.chatId] = action.payload.isTyping;
    },
  },
});

export const {
  setLoading,
  setError,
  setChats,
  addChat,
  setAllMessages, // Export the new action
  addMessage,
  setActiveChatId,
  setModelTyping,
} = chatSlice.actions;

export default chatSlice.reducer;