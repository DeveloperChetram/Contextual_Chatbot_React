import { axiosInstance as axios } from "../../api/axios";
import {
  setChats,
  addChat,
  setAllMessages, // Updated import
  addMessage,
  setLoading,
  setError,
  setActiveChatId,
  setModelTyping,
} from "../reducers/chatSlice";

// Fetches ALL messages for the logged-in user
export const getAllMessages = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`/chat/messages`);
    dispatch(setAllMessages(response.data.messages));
  } catch (error) {
    console.error('Error getting all messages:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Fetches all chat sessions
export const getChats = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get("/chat");
    dispatch(setChats(response.data.chats));
    if (response.data.chats.length > 0) {
      // Set the first chat as active by default
      dispatch(setActiveChatId(response.data.chats[0]._id));
      // Fetch all messages for all chats at once
      dispatch(getAllMessages());
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Creates a new chat session
export const createChat = (title) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post("/chat", { title });
    dispatch(addChat(response.data.chat));
    dispatch(setActiveChatId(response.data.chat._id));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Sends a message
export const sendMessage = (messageData) => async (dispatch) => {
  try {
    dispatch(addMessage({ message: messageData.userMessage }));
    dispatch(setModelTyping({ chatId: messageData.chatId, isTyping: true }));

    const response = await axios.post(`/chat/message`, messageData);

    dispatch(addMessage({ message: response.data.message }));
  } catch (error) {
    console.error("Error sending message:", error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setModelTyping({ chatId: messageData.chatId, isTyping: false }));
  }
};