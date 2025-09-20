import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { axiosInstance } from "../api/axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  getChats,
  createChat,
  sendMessage,
} from "../redux/actions/chatActions";
import {
  setActiveChatId,
  addMessage,
  setModelTyping,
  updateChat,
} from "../redux/reducers/chatSlice";
import { logoutUser } from "../redux/actions/authActions";
import TypingIndicator from "./TypingIndicator";
import ThemeToggler from "./ThemeToggler";
import ChatLoadingAnimation from "./ChatLoadingAnimation";
import { useAuthState, useChatState } from "../hooks/useOptimizedSelectors";
import usePerformanceMonitor from "../hooks/usePerformanceMonitor";

import "../styles/ChatInterface.css";
import { changeCharacter } from "../redux/actions/chatActions";

const Icon = memo(({ path, className = "" }) => (
  <svg className={`icon ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> 
    {path} 
  </svg>
));

const LogoIcon = memo(() => (
  <svg className="logo-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"> 
    <path d="M12.48 3.52a1 1 0 0 0-1 1v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V7.52a1 1 0 0 0-.52-.88l-5.44-3.14a1 1 0 0 0-.5 0zM5.08 7.52a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 .52.88l5.44 3.14a1 1 0 0 0 1.5-.87V11.4a1 1 0 0 0-.52-.88L6.58 7.52a1 1 0 0 0-1.5 0zM12 14.5l-5.44 3.14a1 1 0 0 0-.52.88v2.92a1 1 0 0 0 1.5.87l5.44-3.14a1 1 0 0 0 .52-.88v-2.92a1 1 0 0 0-1.5-.87z" /> 
  </svg>
));

const ChatInterface = memo(() => {
  // Performance monitoring
  usePerformanceMonitor('ChatInterface');
  
  const [isCreditsVisible, setIsCreditsVisible] = useState(false);
  const creditsTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Use optimized selectors to prevent unnecessary re-renders
  const { user, isAuthenticated } = useAuthState();
  const { chats, allMessages, activeChatId, loading, creatingChat, isModelTyping, character } = useChatState();

  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [isCreatingFirstChat, setIsCreatingFirstChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [characterLoading, setCharacterLoading] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [savingChatId, setSavingChatId] = useState(null);
  const chatAreaRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Memoize constants to prevent unnecessary re-renders
  const MAX_TITLE_WORDS = useMemo(() => 35, []);
  const MAX_PROMPT_CHARS = useMemo(() => 1400, []);
  
  const [credits, setCredits] = useState(0);

  // Memoize the credits click handler to prevent unnecessary re-renders
  const handleCreditsClick = useCallback(async () => {
    if (!isAuthenticated) {
      setIsCreditsVisible(true);
      creditsTimeoutRef.current = setTimeout(() => setIsCreditsVisible(false), 3000);
      return;
    }
    setCreditsLoading(true);
    try {
      const response = await axiosInstance.get(`/credits`);
      setCredits(response.data.credits);
      if (creditsTimeoutRef.current) clearTimeout(creditsTimeoutRef.current);
      setIsCreditsVisible(true);
      creditsTimeoutRef.current = setTimeout(() => setIsCreditsVisible(false), 5000);
    } catch (error) {
      // console.error("Error fetching credits:", error);
    } finally {
      setCreditsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      handleCreditsClick();
    }
    return () => { if (creditsTimeoutRef.current) clearTimeout(creditsTimeoutRef.current) };
  }, [isAuthenticated, handleCreditsClick]);

  // Memoize socket initialization
  const initializeSocket = useCallback(() => {
    if (isAuthenticated) {
      dispatch(getChats());
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
      const socketUrl = backendUrl.replace('/api', '');
      const newSocket = io(socketUrl, { withCredentials: true });
      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    return initializeSocket();
  }, [initializeSocket]);

  // Memoize socket event handler
  const handleSocketResponse = useCallback(({ chatId, response, character }) => {
    dispatch(setModelTyping({ chatId, isTyping: false }));
    const modelMessage = { _id: `model-${Date.now()}`, chatId, content: response, role: "model", character: character };
    dispatch(addMessage({ chatId, message: modelMessage }));
    handleCreditsClick();
  }, [dispatch, handleCreditsClick]);

  useEffect(() => {
    if (socket) {
      socket.on("ai-response", handleSocketResponse);
      return () => socket.off("ai-response", handleSocketResponse);
    }
  }, [socket, handleSocketResponse]);

  useEffect(() => {
    if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
  }, [allMessages, activeChatId, isModelTyping]);

  // Memoize textarea resize handler
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);

  // Memoize resize handler
  const handleResize = useCallback(() => {
    const isMobileDevice = window.innerWidth < 768;
    setIsMobile(isMobileDevice);
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
    // Don't auto-close sidebar on mobile resize (keyboard opening)
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (isAuthenticated && !loading && chats.length === 0) {
      setIsCreatingFirstChat(true);
      setNewChatTitle("Untitled Chat");
    }
  }, [isAuthenticated, loading, chats.length]);

  const activeChatMessages = useMemo(() => {
    if (!activeChatId) return [];
    return allMessages.filter((msg) => msg.chatId === activeChatId);
  }, [allMessages, activeChatId]);




  const handleNewChatSubmit = useCallback((e) => {
    e.preventDefault();
    if (!newChatTitle.trim() || titleError) return;
    dispatch(createChat(newChatTitle));
    setNewChatTitle("");
    setIsCreatingNewChat(false);
    setIsCreatingFirstChat(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [newChatTitle, titleError, dispatch]);

  const handleFirstChatSubmit = useCallback((e) => {
    e.preventDefault();
    if (!newChatTitle.trim() || titleError) return;
    dispatch(createChat(newChatTitle));
    setNewChatTitle("");
    setIsCreatingFirstChat(false);
    setIsCreatingNewChat(false);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [newChatTitle, titleError, dispatch]);

  const handleTitleChange = useCallback((e) => {
    const value = e.target.value;
    setNewChatTitle(value);
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
    setTitleError(wordCount > MAX_TITLE_WORDS ? `Title cannot exceed ${MAX_TITLE_WORDS} words.` : "");
  }, [MAX_TITLE_WORDS]);

  const handleHistoryClick = useCallback((id) => {
    dispatch(setActiveChatId(id));
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [dispatch]);

  const handleCreateNewChat = useCallback(() => {
    setIsCreatingNewChat(true);
  }, []);

  // Memoize click outside handler
  const handleClickOutside = useCallback((event) => {
    // Don't close sidebar if clicking on form elements or sidebar itself
    if (event.target.closest('.sidebar') || event.target.closest('input') || event.target.closest('textarea') || event.target.closest('select')) {
      return;
    }
    
    // Close sidebar when clicking outside
    if (window.innerWidth < 768 && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleCopyMessage = useCallback((text, messageId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  }, []);

  const handleCopyCode = useCallback((text, codeId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCodeId(codeId);
      setTimeout(() => setCopiedCodeId(null), 3000);
    });
  }, []);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId || inputValue.length > MAX_PROMPT_CHARS) return;
    dispatch(sendMessage(socket, activeChatId, inputValue, character));
    setInputValue("");
  }, [inputValue, activeChatId, MAX_PROMPT_CHARS, dispatch, socket, character]);

  const logoutHandler = useCallback(async () => {
    const result = await dispatch(logoutUser());
    if (result.success) navigate('/login');
  }, [dispatch, navigate]);

  const handleChangeCharacter = useCallback(async (e) => {
    const character = e.target.value;
    setCharacterLoading(true);
    try {
      await dispatch(changeCharacter(character));
    } catch (error) {
      // console.error('Error changing character:', error);
    } finally {
      setCharacterLoading(false);
    }
  }, [dispatch]);

  const handleEditChat = useCallback((chatId, currentTitle) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingChatId(null);
    setEditingTitle("");
  }, []);

  const handleChatUpdate = useCallback(async (chatId, newTitle) => {
    setSavingChatId(chatId);
    try {
      await axiosInstance.put(`/chat/${chatId}`, { title: newTitle });
      // Update the chat locally instead of refetching all chats
      dispatch(updateChat({ chatId, updates: { title: newTitle } }));
      // Ensure the edited chat remains selected after update
      dispatch(setActiveChatId(chatId));
    } catch (error) {
      console.error("Error updating chat title:", error);
    } finally {
      setEditingChatId(null);
      setEditingTitle("");
      setSavingChatId(null);
    }
  }, [dispatch]);

  const handleSaveEdit = useCallback((e) => {
    e.preventDefault();
    if (!editingTitle.trim() || editingTitle.trim().split(/\s+/).filter(Boolean).length > MAX_TITLE_WORDS) {
      handleCancelEdit();
      return;
    }
    handleChatUpdate(editingChatId, editingTitle.trim());
  }, [editingTitle, MAX_TITLE_WORDS, handleCancelEdit, handleChatUpdate, editingChatId]);

  // Memoize active chat calculation
  const activeChat = useMemo(() => {
    return chats.find((chat) => chat._id === activeChatId);
  }, [chats, activeChatId]);

  return (
    <div className="chat-container">
             <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <LogoIcon />
            <span className="logo-text">Atomic</span>
          </div>
          <button className="sidebar-close-btn" onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }} >
            <Icon path={<path d="M18 6L6 18M6 6l12 12" />} />
          </button>
        </div>
        <div className="sidebar-top"> <nav className="main-nav"> <button className="new-thread-btn" onClick={handleCreateNewChat} disabled={!isAuthenticated || creatingChat}> <Icon path={<path d="M12 5v14m-7-7h14" />} /> <span>{creatingChat ? "Creating..." : "New Chat"}</span> </button> </nav> </div>
        <div className="library">
          <div className="library-header"> <h3>History</h3> </div>
                     {isCreatingNewChat && (<div className="new-chat-form-container"> <form onSubmit={handleNewChatSubmit} className={`new-chat-form ${titleError ? "error" : ""}`}> <input type="text" placeholder="New chat title..." value={newChatTitle} onChange={handleTitleChange} onBlur={() => !newChatTitle && setIsCreatingNewChat(false)} autoFocus/> <button type="submit" className="submit-new-chat-btn" disabled={!!titleError || creatingChat}> <Icon path={titleError ? (<path d="M18 6L6 18M6 6l12 12" />) : (creatingChat ? <path d="M12 2v4m0 4v4" /> : <path d="M20 6L9 17l-5-5" />)} /> </button> </form> {titleError && (<p className="title-error-warning">{titleError}</p>)} </div>)}
          <ul>
            {isAuthenticated ? (
              chats.length > 0 ? (
                chats.map((item) => (
                  <li key={item._id} className={item._id === activeChatId ? "active" : ""}>
                    {editingChatId === item._id ? (
                      <div className="edit-chat-container">
                        <form onSubmit={handleSaveEdit} className="edit-chat-form">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={handleCancelEdit}
                            autoFocus
                            className="edit-chat-input"
                            placeholder="New chat title..."
                          />
                          <button
                            type="submit"
                            className="save-edit-btn"
                            disabled={savingChatId === item._id || !editingTitle.trim()}
                            onMouseDown={(e) => e.preventDefault()} // Prevent onBlur from firing
                          >
                            {savingChatId === item._id ? (
                              <div className="saving-spinner"></div>
                            ) : (
                              <Icon path={<path d="M20 6L9 17l-5-5" />} />
                            )}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <a href="#" onClick={(e) => { e.preventDefault(); handleHistoryClick(item._id); }}>
                        <span>{item.title}</span>
                        {item._id === activeChatId && (
                          <button
                            className="edit-chat-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleEditChat(item._id, item.title);
                            }}
                          >
                            <Icon path={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>} />
                          </button>
                        )}
                      </a>
                    )}
                  </li>
                ))
              ) : (
                <li> <a href="#" className="no-chats"> <span>No chats found</span> </a> </li>
              )
            ) : (
              <li> <a href="#" className="no-chats"> <span>Login to see history</span> </a> </li>
            )}
          </ul>
        </div>
        <div className="sidebar-bottom"> <div className="user-profile"> <div className="user-info"> <Icon path={<> <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /> <circle cx="12" cy="7" r="4" /> </>} /> <span>{user?.fullName?.firstName || "Guest User"}</span> </div> <div className={`credits-container ${isCreditsVisible ? 'show-text' : ''} ${creditsLoading ? 'loading' : ''} ${credits === 0 ? 'zero-credits' : ''}`} onClick={handleCreditsClick} > <span>{creditsLoading ? <div className="loading-spinner"></div> : (isAuthenticated ? `Credits: ${credits}` : (isCreditsVisible ? 'Login First' : 'Credits: 0'))}</span> </div> </div> </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
                         <button className="header-hamburger" onClick={() => setSidebarOpen(true)} >
              <Icon path={<> <path d="M3 12h18" /> <path d="M3 6h18" /> <path d="M3 18h18" /> </>} />
            </button>
            {/* <div className="header-logo">
              <LogoIcon />
              <span className="header-logo-text">Atomic</span>
            </div> */}
            <div className="header-title-wrapper">
              <h2>{activeChat?.title || "Welcome"}</h2>
            </div>
          </div>
          <div className="header-right">
            <ThemeToggler key={`theme-${isAuthenticated}`} />
            {isAuthenticated ? (
              <button className="share-btn logout" onClick={logoutHandler}> Log out </button>
            ) : (
              <button className="share-btn login" onClick={() => navigate('/login')}> Login </button>
            )}
          </div>
        </header>

        <section className="chat-area" ref={chatAreaRef}>
          <div className="chat-content-wrapper">
            {loading && !activeChatMessages.length && <div className="empty-chat-placeholder"><h2>Loading...</h2></div>}

            {creatingChat && <ChatLoadingAnimation />}

            {!loading && !creatingChat && activeChatMessages.length > 0 && activeChatMessages.map((msg, index) => {
              // For user messages, find the character they were talking to
              let userCharacter = character; // Default to current character
              if (msg.role === "user") {
                // Look for the next model message to see which character responded
                const nextModelMessage = activeChatMessages.slice(index + 1).find(m => m.role === "model");
                if (nextModelMessage) {
                  userCharacter = nextModelMessage.character;
                }
              }
              
              return (
              <div key={msg._id} className={`chat-turn ${msg.role}`}>
                  <div className="message-header"> 
                    <h3 className="message-sender" data-character={msg.role === "user" ? userCharacter : msg.character}>
                      {msg.role === "user" ? "You" : (msg.character || "AI Assistant")}
                    </h3> 
                    <button className="copy-btn" onClick={() => handleCopyMessage(msg.content, msg._id)}> 
                      <Icon path={copiedMessageId === msg._id ? <path d="M20 6L9 17l-5-5" /> : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} /> 
                    </button> 
                  </div>
                  <div className="message-text"> 
                    {msg.role === "model" ? (
                      <ReactMarkdown children={msg.content} components={{ 
                        code(props) { 
                          const { children, className, node, ...rest } = props; 
                          const match = /language-(\w+)/.exec(className || ''); 
                          const codeId = `code-${msg._id}-${index}`;
                          return match ? (
                            <div className="code-block-wrapper">
                              <div className="code-block-header">
                                <span className="code-language">{match[1]}</span>
                                <button 
                                  className="code-copy-btn" 
                                  onClick={() => handleCopyCode(String(children).replace(/\n$/, ''), codeId)}
                                  title="Copy code"
                                >
                                  <Icon path={copiedCodeId === codeId ? <path d="M20 6L9 17l-5-5" /> : <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />
                                </button>
                              </div>
                              <SyntaxHighlighter {...rest} children={String(children).replace(/\n$/, '')} style={vscDarkPlus} language={match[1]} PreTag="div" />
                            </div>
                          ) : (
                            <code {...rest} className={className}> {children} </code>
                          ) 
                        } 
                      }} />
                    ) : (
                      msg.content
                    )} 
                  </div>
              </div>
              );
            })}

            {isModelTyping[activeChatId] && <TypingIndicator character={character} />}

            {!loading && !creatingChat && activeChatMessages.length === 0 && !isModelTyping[activeChatId] && (
              <div className="empty-chat-placeholder">
                {activeChatId ? (
                  <>
                    <h2>Start a new conversation</h2>
                    <p>Type your first message below.</p>
                  </>
                ) : isAuthenticated ? (
                  chats.length === 0 ? (
                    <>
                      <h2>Start Your First Chat</h2>
                      <p>Create your first chat to begin your conversation with Atomic.</p>
                                             <div className="first-chat-form-container">
                         <form onSubmit={handleFirstChatSubmit} className={`first-chat-form ${titleError ? "error" : ""}`}>
                           <input
                             type="text"
                             placeholder="Untitled Chat"
                             value={newChatTitle}
                             onChange={handleTitleChange}
                             onBlur={() => !newChatTitle && setIsCreatingFirstChat(false)}
                             autoFocus
                           />
                           <button type="submit" className="submit-first-chat-btn" disabled={!!titleError || creatingChat}>
                             <Icon path={titleError ? <path d="M18 6L6 18M6 6l12 12" /> : (creatingChat ? <path d="M12 2v4m0 4v4" /> : <path d="M20 6L9 17l-5-5" />)} />
                           </button>
                         </form>
                         {titleError && <p className="title-error-warning">{titleError}</p>}
                       </div>
                    </>
                  ) : (
                    <>
                      <h2>Select or create a chat to begin</h2>
                      <p>Choose a chat from the sidebar or create a new one.</p>
                    </>
                  )
                ) : (
                  <>
                    <h2>Welcome to Atomic</h2>
                    <p>Atomic helps you to find out accurate, concise and truthful answers. Login to explore more characters.</p>
                    <button className="login-to-chat-btn" onClick={() => navigate('/login')}>

                      Login to Start Chatting
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

                 <section className="chat-input-area">
           <form className="input-form" onSubmit={handleSendMessage}>
             <div className="input-wrapper"> <textarea ref={textareaRef} rows="1" placeholder={!isAuthenticated ? "Login to chat" : (characterLoading ? "Changing character..." : (!activeChatId ? "Make chat first then send message" : "Ask anything..."))} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} disabled={characterLoading || !isAuthenticated || !activeChatId} /> </div>
             <div className="input-footer">
               <div className="input-footer-left"> <select name="model" value={character} className={`model-selector ${characterLoading ? 'loading' : ''}`} onChange={handleChangeCharacter} disabled={characterLoading || !isAuthenticated || !activeChatId}> <option value="jahnvi">Jahnvi</option> <option value="atomic">Atomic</option> <option value="chandni">Chandni</option>
                 <option value="bhaiya"> Harsh Bhaiya</option>
               </select> <div className={`char-counter ${inputValue.length > MAX_PROMPT_CHARS ? "error" : ""}`} > {MAX_PROMPT_CHARS - inputValue.length} / 1400 </div> </div>
               <div className="input-footer-right"> <button type="submit" className="send-button" disabled={!inputValue.trim() || inputValue.length > MAX_PROMPT_CHARS || !activeChatId || characterLoading || !isAuthenticated}> <Icon path={<> <line x1="12" y1="19" x2="12" y2="5" /> <polyline points="5 12 12 5 19 12" /> </>} /> </button> </div>
             </div>
           </form>
         </section>
      </main>
    </div>
  );
});

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;