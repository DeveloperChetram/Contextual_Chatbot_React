import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from "socket.io-client";
import { logoutUser } from '../redux/actions/authActions';
import { axiosInstance as axios } from '../api/axios';
import '../styles/theme.css';
import '../styles/ChatInterface.css';

// --- Helper Components (Unchanged) ---
const Icon = ({ path, className = '' }) => (
  <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const LogoIcon = () => (
    <svg className="logo-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z"/>
    </svg>
);

// --- Main Chat Component ---
const ChatInterface = () => {
  const userData = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // --- State Management ---
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [chats, setChats] = useState({}); // Stores all chat data, keyed by chat ID
  const [historyItems, setHistoryItems] = useState([]); // For sidebar display
  const [inputValue, setInputValue] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isModelTyping, setIsModelTyping] = useState(false);

  // --- Refs ---
  const chatAreaRef = useRef(null);
  const sidebarRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Constants ---
  const MAX_TITLE_WORDS = 35;
  const MAX_PROMPT_CHARS = 1400;

  // --- Derived State ---
  const activeChat = chats[activeChatId] || null;

  // --- Helper Functions ---
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  const logoutHandler = () => {
    dispatch(logoutUser());
  };

  // --- Effects ---

  // Effect for Initial Data Fetch
  useEffect(() => {
    // API_CALL_PLACEHOLDER: Fetch all chat histories for the logged-in user.
    axios.get('/chat')
      .then((res) => {
        const fetchedChats = res.data.chats; // Assuming the API returns an array of chats
        
        if (fetchedChats && fetchedChats.length > 0) {
          const history = fetchedChats.map(chat => ({ id: chat._id, text: chat.title }));
          const chatsData = fetchedChats.reduce((acc, chat) => {
            acc[chat._id] = { title: chat.title, messages: chat.messages || [] };
            return acc;
          }, {});

          setHistoryItems(history);
          setChats(chatsData);
          setActiveChatId(fetchedChats[0]._id); // Activate the most recent chat
        }
      })
      .catch((err) => {
        console.error("Failed to fetch chats:", err);
        // Optionally, handle the error in the UI
      });
  }, []);

  // Effect for WebSocket Connection
  useEffect(() => {
    // API_CALL_PLACEHOLDER: Ensure your backend URL is correct.
    const newSocket = io("http://localhost:3000", { withCredentials: true });
    setSocket(newSocket);

    // Listener for streaming AI response
    newSocket.on('ai-response-chunk', ({ chatId, chunk }) => {
      if (chatId === activeChatId) {
        setChats(prev => {
          const updatedMessages = [...prev[chatId].messages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage && lastMessage.from === 'model') {
            lastMessage.text += chunk;
          }
          return { ...prev, [chatId]: { ...prev[chatId], messages: updatedMessages } };
        });
      }
    });
    
    // Listener for when the AI response is complete
    newSocket.on('ai-response-end', ({ chatId }) => {
        if (chatId === activeChatId) {
            setIsModelTyping(false);
        }
    });

    // Listener for error events
    newSocket.on('error', ({ message, error }) => {
        console.error('Socket error:', message, error);
        setIsModelTyping(false);
        // You could show a user-friendly error message here
        alert(`Error: ${message}`);
    });


    return () => newSocket.disconnect();
  }, [activeChatId]); // Re-connect if active chat changes, or remove dependency if socket is global

  // Effect for auto-scrolling
  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isModelTyping]);

  // Effect for auto-resizing textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  // Effect for responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    handleResize(); // Initial check

    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // --- Event Handlers ---

  const handleCreateNewChat = () => {
    setIsCreatingNewChat(true);
  };

  const handleNewChatSubmit = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim() || titleError) return;
    
    try {
      // API_CALL_PLACEHOLDER: Send new chat title to the backend.
      const response = await axios.post('/chat', { title: newChatTitle });
      const newChat = response.data.chat; // Assuming backend returns the new chat object
      console.log("newChat",newChat)
      const newChatItem = { id: newChat._id, text: newChat.title };
      
      setHistoryItems(prev => [newChatItem, ...prev]);
      setChats(prev => ({ ...prev, [newChat._id]: { title: newChat.title, messages: [] } }));
      setActiveChatId(newChat._id);
      
      setNewChatTitle("");
      setIsCreatingNewChat(false);
    } catch (err) {
      console.error("Failed to create new chat:", err);
      // Optionally, set an error state to show the user
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setNewChatTitle(value);
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    setTitleError(wordCount > MAX_TITLE_WORDS ? `Title cannot exceed ${MAX_TITLE_WORDS} words.` : "");
  };

  const handleHistoryClick = (id) => {
    setActiveChatId(id);
    
    // Only fetch if messages aren't already loaded
    if (!chats[id] || chats[id].messages.length === 0) {
      // API_CALL_PLACEHOLDER: Fetch messages for the selected chat.
      axios.get(`/chat/${id}`)
        .then(res => {
          const fetchedChat = res.data.chat;
          setChats(prev => ({
            ...prev,
            [id]: { title: fetchedChat.title, messages: fetchedChat.messages || [] }
          }));
        })
        .catch(err => console.error("Failed to fetch chat history:", err));
    }

    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleCopyMessage = (text, messageId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId || isModelTyping || inputValue.length > MAX_PROMPT_CHARS) return;
    
    // Additional safety check for activeChatId
    if (!activeChatId) {
      console.error("No active chat selected");
      return;
    }
    
    const userMessage = { id: `user-${Date.now()}`, from: 'user', text: inputValue };
    const modelPlaceholder = { id: `model-${Date.now()}`, from: 'model', text: "" };

    // Optimistically update UI
    setChats(prev => {
      if (!prev[activeChatId]) {
        console.error("Chat not found:", activeChatId);
        return prev;
      }
      return {
        ...prev,
        [activeChatId]: {
          ...prev[activeChatId],
          messages: [...prev[activeChatId].messages, userMessage, modelPlaceholder]
        }
      };
    });
    setInputValue("");
    setIsModelTyping(true);
    setTimeout(scrollToBottom, 0);

    // API_CALL_PLACEHOLDER: Send message via WebSocket.
    if (socket) {
      socket.emit('user-message', {
        chatId: activeChatId,
        content: inputValue
      });
    }
  };

  return (
    <div className="chat-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
        <div className="sidebar-header">
            <div className="logo-container"> <LogoIcon /> </div>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                <Icon path={<path d="M18 6L6 18M6 6l12 12" />} />
            </button>
        </div>
        <div className="sidebar-top">
          <nav className="main-nav">
             <button className="new-thread-btn" onClick={handleCreateNewChat}>
                <Icon path={<path d="M12 5v14m-7-7h14" />} />
                <span>New Chat</span>
            </button>
          </nav>
        </div>
        <div className="library">
          <div className="library-header"> <h3>History</h3> </div>
          {isCreatingNewChat && (
            <div className="new-chat-form-container">
              <form onSubmit={handleNewChatSubmit} className={`new-chat-form ${titleError ? 'error' : ''}`}>
                <input 
                  type="text"
                  placeholder="New chat title..."
                  value={newChatTitle}
                  onChange={handleTitleChange}
                  onBlur={() => !newChatTitle && setIsCreatingNewChat(false)}
                  autoFocus
                />
                <button type="submit" className="submit-new-chat-btn" disabled={!!titleError}>
                  <Icon path={titleError ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M20 6L9 17l-5-5" />} />
                </button>
              </form>
              {titleError && <p className="title-error-warning">{titleError}</p>}
            </div>
          )}
          <ul>
            {historyItems.length > 0 ? historyItems.map((item) => (
              <li key={item.id} className={item.id === activeChatId ? 'active' : ''}>
                <a href="#" onClick={(e) => { e.preventDefault(); handleHistoryClick(item.id); }}>
                    <span>{item.text}</span>
                </a>
              </li>
            )) : <li><a href="#" className="no-chats"><span>No chats found</span></a></li>}
          </ul>
        </div>
        <div className="sidebar-bottom">
            <div className="user-profile">
                <div className="user-info">
                    <Icon path={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} /> 
                    <span>{userData?.user?.fullName?.firstName || "Username"}</span>
                </div>
                <div className="credits-container">
                    <span>Credits: 50</span>
                </div>
            </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
            <div className="header-left">
                <button className="header-hamburger" onClick={() => setSidebarOpen(prev => !prev)}>
                    <Icon path={<><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></>} />
                </button>
                <div className="header-title-wrapper">
                    <h2>{activeChat?.title || "Welcome"}</h2>
                </div>
            </div>
            <div className="header-right">
                 <button className="share-btn logout" onClick={logoutHandler}>Log out</button>
            </div>
        </header>

        <section className="chat-area" ref={chatAreaRef}>
          <div className="chat-content-wrapper">
            {activeChat?.messages?.length > 0 ? (
              activeChat.messages.map((msg) => (
                msg.text || (msg.from === 'model' && isModelTyping) ? ( // Render model message only if it has text or is the one currently typing
                  <div key={msg.id} className={`chat-turn ${msg.from}`}>
                    <div className="message-header">
                      <h3 className="message-sender">{msg.from === 'user' ? 'You' : 'Model'}</h3>
                      <button className="copy-btn" onClick={() => handleCopyMessage(msg.text, msg.id)}>
                          <Icon path={copiedMessageId === msg.id ? <path d="M20 6L9 17l-5-5"/> : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />
                      </button>
                    </div>
                    <p className="message-text">{msg.text}</p>
                  </div>
                ) : null
              ))
            ) : (
              <div className="empty-chat-placeholder">
                <h2>{activeChatId ? "Start a new conversation" : "Select or create a chat to begin"}</h2>
                <p>{activeChatId ? "Type your first message below." : "Choose a chat from the sidebar or create a new one."}</p>
              </div>
            )}
            {isModelTyping && activeChat?.messages[activeChat.messages.length - 1]?.from === 'model' && !activeChat.messages[activeChat.messages.length - 1]?.text && (
                <div className="chat-turn model">
                    <div className="message-header"> <h3 className="message-sender">Model</h3> </div>
                    <div className="typing-indicator">
                       <span className="typing-text">Typing</span>
                       <div className="dots-container">
                          <span></span><span></span><span></span>
                       </div>
                    </div>
                </div>
            )}
          </div>
        </section>

        <section className="chat-input-area">
            <form className="input-form" onSubmit={handleSendMessage}>
                <div className="input-wrapper">
                  <textarea 
                    ref={textareaRef}
                    rows="1"
                    placeholder="Ask anything..." 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                        }
                    }}
                  />
                </div>
                <div className="input-footer">
                    <div className="input-footer-left">
                        <select name="model" className="model-selector">
                            <option value="jhanvi">Jhanvi</option>
                            <option value="chandni">Chandni</option>
                        </select>
                        <div className={`char-counter ${inputValue.length > MAX_PROMPT_CHARS  ? 'error' : ''}`}>
                            {MAX_PROMPT_CHARS - inputValue.length} / 1400
                        </div>
                    </div>
                    <div className="input-footer-right">
                        <button type="submit" className="send-button" disabled={!inputValue.trim() || isModelTyping || inputValue.length > MAX_PROMPT_CHARS || !activeChatId}>
                          <Icon path={<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>} />
                        </button>
                    </div>
                </div>
            </form>
        </section>
      </main>
    </div>
  );
};

export default ChatInterface;