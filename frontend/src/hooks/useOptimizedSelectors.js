import { useSelector } from 'react-redux';
import { useMemo } from 'react';

// Optimized selector hook to prevent unnecessary re-renders
export const useOptimizedSelector = (selector, equalityFn) => {
  return useSelector(selector, equalityFn || ((a, b) => a === b));
};

// Memoized selector hook for complex state selections
export const useMemoizedSelector = (selector, deps = []) => {
  return useMemo(() => selector, deps);
};

// Auth state selector
export const useAuthState = () => {
  return useOptimizedSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    error: state.auth.error
  }));
};

// Chat state selector
export const useChatState = () => {
  return useOptimizedSelector((state) => ({
    chats: state.chat.chats,
    allMessages: state.chat.allMessages,
    activeChatId: state.chat.activeChatId,
    loading: state.chat.loading,
    creatingChat: state.chat.creatingChat,
    isModelTyping: state.chat.isModelTyping,
    character: state.chat.character
  }));
};

export default useOptimizedSelector;
