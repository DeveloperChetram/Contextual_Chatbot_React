import { axiosInstance as axios } from "../../api/axios";
import {
  setChats,
  addChat,
  setAllMessages, // <-- Use the new action
  addMessage,
  setLoading,
  setError,
  setActiveChatId,
  setModelTyping,
  setCharacter,
} from "../reducers/chatSlice";

// Action to fetch ALL messages for the user at once
export const getAllMessages = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get("/chat/messages");
    dispatch(setAllMessages(response.data.messages));
  } catch (error) {
    console.error('Error getting all messages:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Updated to fetch chats and then fetch all messages
export const getChats = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get("/chat");
    dispatch(setChats(response.data.chats));
    if (response.data.chats.length > 0) {
      // Set the first chat as active by default
      dispatch(setActiveChatId(response.data.chats[0]._id));
      // Fetch all messages for all chats
      dispatch(getAllMessages());
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createChat = (title) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post("/chat", { title });
    dispatch(addChat(response.data.chat));
    dispatch(setActiveChatId(response.data.chat._id));
    // No need to fetch messages here, as we already have them all
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// sendMessage is now simplified
export const sendMessage = (socket, chatId, content, character) => (dispatch) => {
  const userMessage = {
    _id: `user-${Date.now()}`,
    chatId,
    content,
    role: "user",
  };
  dispatch(addMessage({ message: userMessage }));
  dispatch(setModelTyping({ chatId, isTyping: true }));

  socket.emit("user-message", {
    chatId: chatId,
    content: content,
    character: character,
  });
};
export const changeCharacter = (character) => async (dispatch) => {
  try {
    const response = await axios.get(`/change-character/${character}`);
    dispatch(setCharacter(character));
    
  } catch (error) {
    console.error('Error changing character:', error);
  }
};