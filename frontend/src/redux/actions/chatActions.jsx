import { axiosInstance as axios } from "../../api/axios";
import {
  setChats,
  addChat,
  setMessages,
  addMessage,
  setLoading,
  setError,
  setActiveChatId,
} from "../reducers/chatSlice";

export const getChats = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get("/chat");
    dispatch(setChats(response.data.chats));
    if (response.data.chats.length > 0) {
      dispatch(setActiveChatId(response.data.chats[0]._id));
      dispatch(getMessages(response.data.chats[0]._id));
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
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const getMessages = (chatId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`/chat/messages?chatId=${chatId}`);
    dispatch(setMessages({ chatId, messages: response.data.messages }));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const sendMessage = (socket, chatId, content) => (dispatch) => {
  const userMessage = {
    _id: `user-${Date.now()}`,
    chatId,
    content,
    role: "user",
  };
  dispatch(addMessage({ chatId, message: userMessage }));

  socket.emit("user-message", {
    chatId: chatId,
    content: content,
  });
};