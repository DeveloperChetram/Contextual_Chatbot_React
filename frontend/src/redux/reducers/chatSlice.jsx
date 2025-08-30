import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  allMessages: [],
  activeChatId: null,
  loading: false,
  error: null,
  isModelTyping: {},
  character: "atomic",
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
    setAllMessages: (state, action) => {
      state.allMessages = action.payload;
    },
    addMessage: (state, action) => {
      const exists = state.allMessages.some(msg => msg._id === action.payload.message._id);
      if (!exists) {
        state.allMessages.push(action.payload.message);
      }
    },
    setActiveChatId: (state, action) => {
      state.activeChatId = action.payload;
    },
    setModelTyping: (state, action) => {
      state.isModelTyping[action.payload.chatId] = action.payload.isTyping;
    },
    setCharacter: (state, action) => {
      state.character = action.payload;
    },
    clearChatStore: (state) => {
      state.chats = [];
      state.allMessages = [];
      state.activeChatId = null;
      state.loading = false;
      state.error = null;
      state.isModelTyping = {};
      state.character = "atomic";
    },
  },
});

export const {
  setLoading,
  setError,
  setChats,
  addChat,
  setAllMessages,
  addMessage,
  setActiveChatId,
  setModelTyping,
  setCharacter,
  clearChatStore,
} = chatSlice.actions;

export default chatSlice.reducer;