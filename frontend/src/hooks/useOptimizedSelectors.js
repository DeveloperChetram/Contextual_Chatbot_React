import { useSelector, shallowEqual } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// Create memoized selectors using createSelector for better performance
const selectAuthState = (state) => state.auth;
const selectChatState = (state) => state.chat;

// Memoized auth selectors
const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);


const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.loading
);

const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

// Memoized chat selectors
const selectChats = createSelector(
  [selectChatState],
  (chat) => chat.chats
);

const selectAllMessages = createSelector(
  [selectChatState],
  (chat) => chat.allMessages
);

const selectActiveChatId = createSelector(
  [selectChatState],
  (chat) => chat.activeChatId
);

const selectChatLoading = createSelector(
  [selectChatState],
  (chat) => chat.loading
);

const selectCharacter = createSelector(
  [selectChatState],
  (chat) => chat.character
);

const selectIsModelTyping = createSelector(
  [selectChatState],
  (chat) => chat.isModelTyping
);

// Auth state selector with proper memoization
export const useAuthState = () => {
  return useSelector(
    (state) => ({
      user: state.auth.user,
      isAuthenticated: state.auth.isAuthenticated,
      loading: state.auth.loading,
      error: state.auth.error,
    }),
    shallowEqual
  );
};

// Chat state selector with proper memoization
export const useChatState = () => {
  return useSelector(
    (state) => ({
      chats: state.chat.chats,
      allMessages: state.chat.allMessages,
      activeChatId: state.chat.activeChatId,
      loading: state.chat.loading,
      creatingChat: state.chat.creatingChat,
      isModelTyping: state.chat.isModelTyping,
      character: state.chat.character,
    }),
    shallowEqual
  );
};

// Individual optimized selectors using createSelector
export const useUser = () => useSelector(selectUser);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);
export const useAuthLoading = () => useSelector(selectAuthLoading);
export const useAuthError = () => useSelector(selectAuthError);
export const useChats = () => useSelector(selectChats);
export const useAllMessages = () => useSelector(selectAllMessages);
export const useActiveChatId = () => useSelector(selectActiveChatId);
export const useChatLoading = () => useSelector(selectChatLoading);
export const useCharacter = () => useSelector(selectCharacter);
export const useIsModelTyping = () => useSelector(selectIsModelTyping);
