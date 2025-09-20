import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [],
  allMessages: [],
  activeChatId: null,
  loading: false,
  creatingChat: false,
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
    setCreatingChat: (state, action) => {
      state.creatingChat = action.payload;
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
    updateChat: (state, action) => {
      const { chatId, updates } = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat._id === chatId);
      if (chatIndex !== -1) {
        // Only update if there are actual changes
        const currentChat = state.chats[chatIndex];
        const hasChanges = Object.keys(updates).some(key => 
          currentChat[key] !== updates[key]
        );
        
        if (hasChanges) {
          state.chats[chatIndex] = { ...currentChat, ...updates };
        }
      }
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
      // Only update if the active chat ID actually changed
      if (state.activeChatId !== action.payload) {
        state.activeChatId = action.payload;
      }
    },
    setModelTyping: (state, action) => {
      const { chatId, isTyping } = action.payload;
      // Only update if the typing state actually changed
      if (state.isModelTyping[chatId] !== isTyping) {
        state.isModelTyping[chatId] = isTyping;
      }
    },
    setCharacter: (state, action) => {
      // Only update if the character actually changed
      if (state.character !== action.payload) {
        state.character = action.payload;
      }
    },
    clearChatStore: (state) => {
      state.chats = [];
      state.allMessages = [];
      state.activeChatId = null;
      state.loading = false;
      state.creatingChat = false;
      state.error = null;
      state.isModelTyping = {};
      state.character = "atomic";
    },
  },
});

export const {
  setLoading,
  setCreatingChat,
  setError,
  setChats,
  addChat,
  updateChat,
  setAllMessages,
  addMessage,
  setActiveChatId,
  setModelTyping,
  setCharacter,
  clearChatStore,
} = chatSlice.actions;

export default chatSlice.reducer;