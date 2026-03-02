import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { axiosInstance } from '../api/axios.jsx';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getChats, createChat, sendMessage, switchChat } from '../redux/actions/chatActions';
import { setActiveChatId, addMessage, setModelTyping, setCharacter } from '../redux/reducers/chatSlice';
import { setCustomCharacters } from '../redux/reducers/customCharacterSlice';
import { logoutUser } from '../redux/actions/authActions';
import { useAuthState, useChatState } from '../hooks/useOptimizedSelectors.js';

// Split components
import Sidebar from './chat/Sidebar';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import ChatInputForm from './chat/ChatInputForm';

import '../styles/ChatInterface.css';

const ChatInterface = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const { chats, allMessages, activeChatId, loading, creatingChat, isModelTyping, character } = useChatState();

  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [inputValue, setInputValue] = useState('');
  const [lastPrompt, setLastPrompt] = useState('');
  const [credits, setCredits] = useState(0);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [isCreditsVisible, setIsCreditsVisible] = useState(false);
  const [characterLoading, setCharacterLoading] = useState(false);
  const creditsTimeoutRef = useRef(null);

  // Memoize active chat messages — filter from flat allMessages array
  const activeChatMessages = useMemo(() => {
    if (!activeChatId) return [];
    return allMessages.filter((msg) => msg.chatId === activeChatId);
  }, [allMessages, activeChatId]);

  // Memoize active chat object
  const activeChat = useMemo(() => chats.find((c) => c._id === activeChatId), [chats, activeChatId]);

  // Credits fetch
  const handleCreditsClick = useCallback(async () => {
    if (!isAuthenticated) {
      setIsCreditsVisible(true);
      creditsTimeoutRef.current = setTimeout(() => setIsCreditsVisible(false), 3000);
      return;
    }
    setCreditsLoading(true);
    try {
      const response = await axiosInstance.get('/credits');
      setCredits(response.data.credits);
      if (creditsTimeoutRef.current) clearTimeout(creditsTimeoutRef.current);
      setIsCreditsVisible(true);
      creditsTimeoutRef.current = setTimeout(() => setIsCreditsVisible(false), 5000);
    } catch (error) {
      // silent fail
    } finally {
      setCreditsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) handleCreditsClick();
    return () => { if (creditsTimeoutRef.current) clearTimeout(creditsTimeoutRef.current); };
  }, [isAuthenticated, handleCreditsClick]);

  // Load custom characters into Redux when user logs in
  useEffect(() => {
    if (!isAuthenticated) return;
    axiosInstance.get('/characters')
      .then(r => dispatch(setCustomCharacters(r.data.characters)))
      .catch(() => { });
  }, [isAuthenticated, dispatch]);

  // Socket init
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(getChats());
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const socketUrl = backendUrl.replace('/api', '');
    const newSocket = io(socketUrl, { withCredentials: true });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [dispatch, isAuthenticated]);

  // Socket events
  useEffect(() => {
    if (!socket) return;
    const handleResponse = ({ chatId, response, character: respChar, error }) => {
      dispatch(setModelTyping({ chatId, isTyping: false }));
      dispatch(addMessage({
        chatId,
        message: {
          _id: `model-${Date.now()}`,
          chatId,
          content: response,
          role: 'model',
          character: respChar,
          error: error === 'quota-exceeded',
        },
      }));
      if (error !== 'quota-exceeded') handleCreditsClick();
    };
    const handleError = (error) => console.error('Socket error:', error.message);
    socket.on('ai-response', handleResponse);
    socket.on('error', handleError);
    return () => {
      socket.off('ai-response', handleResponse);
      socket.off('error', handleError);
    };
  }, [socket, dispatch, handleCreditsClick]);




  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.sidebar') || event.target.closest('input') || event.target.closest('textarea')) return;
      if (window.innerWidth < 768 && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const handleSelectChat = useCallback((id) => {
    dispatch(switchChat(id));
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [dispatch]);

  const handleNewChat = useCallback((title) => {
    dispatch(createChat(title));
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [dispatch]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId) return;
    setLastPrompt(inputValue);
    dispatch(sendMessage(socket, activeChatId, inputValue, character));
    setInputValue('');
  }, [inputValue, activeChatId, dispatch, socket, character]);

  const handleChangeCharacter = useCallback(async (e) => {
    const newChar = e.target.value;
    setCharacterLoading(true);
    try {
      dispatch(setCharacter(newChar));
    } finally {
      setCharacterLoading(false);
    }
  }, [dispatch]);

  const handleLogout = useCallback(async () => {
    const result = await dispatch(logoutUser());
    if (result.success) navigate('/login');
  }, [dispatch, navigate]);

  return (
    <div className="chat-container">
      <Sidebar
        sidebarOpen={sidebarOpen}
        isAuthenticated={isAuthenticated}
        user={user}
        chats={chats}
        activeChatId={activeChatId}
        creatingChat={creatingChat}
        credits={credits}
        creditsLoading={creditsLoading}
        isCreditsVisible={isCreditsVisible}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onCreditsClick={handleCreditsClick}
      />
      <main className="main-content">
        <ChatHeader
          activeChat={activeChat}
          isAuthenticated={isAuthenticated}
          onSidebarOpen={() => setSidebarOpen(true)}
          onLogout={handleLogout}
          onLogin={() => navigate('/login')}
        />
        <MessageList
          messages={activeChatMessages}
          loading={loading}
          creatingChat={creatingChat}
          activeChatId={activeChatId}
          isModelTyping={isModelTyping}
          isAuthenticated={isAuthenticated}
          chatsCount={chats.length}
          character={character}
        />
        <ChatInputForm
          inputValue={inputValue}
          setInputValue={setInputValue}
          activeChatId={activeChatId}
          isAuthenticated={isAuthenticated}
          character={character}
          characterLoading={characterLoading}
          isModelTyping={isModelTyping}
          lastPrompt={lastPrompt}
          onSendMessage={handleSendMessage}
          onChangeCharacter={handleChangeCharacter}
        />
      </main>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';
export default ChatInterface;