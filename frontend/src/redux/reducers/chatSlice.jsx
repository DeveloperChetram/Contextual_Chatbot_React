import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  messages: {},
  activeChatId: null,
  loading: false,
  error: null,
  isModelTyping: {}, // Add this line
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addChat: (state, action) => {
      state.chats.unshift(action.payload);
    },
    setMessages: (state, action) => {
      console.log('Setting messages for chatId:', action.payload.chatId);
      console.log('Messages:', action.payload.messages);
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action) => {
      if (!state.messages[action.payload.chatId]) {
        state.messages[action.payload.chatId] = [];
      }
      state.messages[action.payload.chatId].push(action.payload.message);
    },
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    // Add this new reducer
    setModelTyping: (state, action) => {
      const { chatId, isTyping } = action.payload;
      state.isModelTyping[chatId] = isTyping;
    },
  },
});

export const {
  setChats,
  addChat,
  setMessages,
  addMessage,
  setActiveChatId,
  setLoading,
  setError,
  setModelTyping, // Export the new action
} = chatSlice.actions;
export default chatSlice.reducer;