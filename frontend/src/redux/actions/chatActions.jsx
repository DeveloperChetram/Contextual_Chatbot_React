import { axiosInstance as axios } from '../../api/axios.jsx';
import {
  setChats,
  addChat,
  setAllMessages,
  addMessage,
  setLoading,
  setCreatingChat,
  setError,
  setActiveChatId,
  setModelTyping,
} from '../reducers/chatSlice';

/**
 * BUG-01 FIX: Fetches messages only for the specified chatId (not all messages).
 * Uses the new GET /api/chat/:id/messages endpoint with cursor pagination.
 */
export const getMessagesByChat = (chatId) => async (dispatch) => {
  try {
    const response = await axios.get(`/chat/${chatId}/messages`);
    dispatch(setAllMessages(response.data.messages));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const getChats = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get('/chat');
    dispatch(setChats(response.data.chats));
    // Load messages only for the first/most recent chat — lazy, on-demand
    if (response.data.chats.length > 0) {
      const firstChatId = response.data.chats[0]._id;
      dispatch(setActiveChatId(firstChatId));
      dispatch(getMessagesByChat(firstChatId));
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createChat = (title) => async (dispatch) => {
  dispatch(setCreatingChat(true));
  try {
    const response = await axios.post('/chat', { title });
    dispatch(addChat(response.data.chat));
    dispatch(setActiveChatId(response.data.chat._id));
    // New chat has no messages — clear message list for this chat
    dispatch(setAllMessages([]));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setCreatingChat(false));
  }
};

/**
 * Called when user switches to a different chat from the sidebar.
 * Lazily fetches messages only for that chat.
 */
export const switchChat = (chatId) => async (dispatch, getState) => {
  const { allMessages } = getState().chat;
  const alreadyLoaded = allMessages.some((msg) => msg.chatId === chatId);

  dispatch(setActiveChatId(chatId));

  if (!alreadyLoaded) {
    dispatch(getMessagesByChat(chatId));
  }
};

export const sendMessage = (socket, chatId, content, character) => (dispatch) => {
  const userMessage = {
    _id: `user-${Date.now()}`,
    chatId,
    content,
    role: 'user',
    character, // BUG-04 fix: include character field
  };
  dispatch(addMessage({ chatId, message: userMessage }));
  dispatch(setModelTyping({ chatId, isTyping: true }));
  socket.emit('user-message', { chatId, content, character });
};

// changeCharacter action removed — FLAW-03 fix.
// Character selector in ChatInterface dispatches setCharacter directly from chatSlice.